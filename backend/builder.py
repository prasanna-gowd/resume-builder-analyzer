"""
Resume Builder API — Modular router for save/load/improve/PDF endpoints.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fpdf import FPDF
import json, io, re, random
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/builder", tags=["Builder"])
BUILDER_FILE = "builder_resumes.json"

# ---- Models ----
class ResumeFormData(BaseModel):
    personal: dict = {}
    education: list[dict] = []
    experience: list[dict] = []
    skills: list[dict] = []
    projects: list[dict] = []
    certifications: list[dict] = []

class SaveRequest(BaseModel):
    id: str | None = None
    template_id: str = "modern-1"
    data: ResumeFormData
    name: str = "Untitled Resume"

class ImproveRequest(BaseModel):
    text: str
    content_type: str = "bullet"

# ---- Storage ----
def _load():
    try:
        with open(BUILDER_FILE, "r") as f: return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError): return []

def _save(data):
    with open(BUILDER_FILE, "w") as f: json.dump(data, f, indent=2)

# ---- Content Improvement (rule-based, no API key needed) ----
WEAK_VERBS = {
    "worked on": ["Developed", "Engineered", "Executed"],
    "helped with": ["Facilitated", "Contributed to", "Supported"],
    "was responsible for": ["Led", "Managed", "Directed"],
    "responsible for": ["Managed", "Oversaw", "Directed"],
    "did": ["Executed", "Performed", "Accomplished"],
    "made": ["Created", "Designed", "Produced"],
    "used": ["Leveraged", "Utilized", "Applied"],
    "assisted": ["Contributed to", "Supported", "Collaborated on"],
    "involved in": ["Participated in", "Contributed to", "Drove"],
    "tasked with": ["Spearheaded", "Led", "Executed"],
}
STRONG_VERBS = ["Architected","Spearheaded","Orchestrated","Pioneered","Transformed",
                "Optimized","Streamlined","Automated","Delivered","Launched",
                "Accelerated","Revamped","Championed","Implemented","Engineered"]

def _improve_text(text, content_type="bullet"):
    t = text.strip()
    if not t: return t
    lower = t.lower()
    for weak, replacements in WEAK_VERBS.items():
        if lower.startswith(weak):
            t = random.choice(replacements) + " " + t[len(weak):].strip()
            break
    else:
        first = t.split()[0].lower() if t.split() else ""
        if first not in [v.lower() for v in STRONG_VERBS] and content_type == "bullet":
            t = random.choice(STRONG_VERBS) + " " + t[0].lower() + t[1:]
    t = t[0].upper() + t[1:]
    if not t.endswith(('.','!','?')): t += '.'
    return t

# ---- PDF Generation ----
def _section_hdr(pdf, title):
    pdf.set_font("Helvetica","B",12); pdf.set_text_color(59,130,246)
    pdf.cell(0,8,title,ln=True)
    pdf.set_draw_color(59,130,246); pdf.line(10,pdf.get_y(),200,pdf.get_y()); pdf.ln(3)

def _gen_pdf(data):
    pdf = FPDF(); pdf.set_auto_page_break(True,15); pdf.add_page()
    p = data.get("personal",{})
    pdf.set_font("Helvetica","B",24); pdf.set_text_color(30,41,59)
    pdf.cell(0,12,p.get("name","Your Name"),ln=True,align="C")
    if p.get("title"):
        pdf.set_font("Helvetica","",12); pdf.set_text_color(100,116,139)
        pdf.cell(0,7,p["title"],ln=True,align="C")
    parts=[x for x in [p.get("email"),p.get("phone"),p.get("location")] if x]
    if parts:
        pdf.set_font("Helvetica","",9); pdf.cell(0,6," | ".join(parts),ln=True,align="C")
    links=[x for x in [p.get("linkedin"),p.get("github")] if x]
    if links:
        pdf.set_font("Helvetica","",9); pdf.cell(0,6," | ".join(links),ln=True,align="C")
    pdf.ln(5)
    if p.get("summary"):
        _section_hdr(pdf,"PROFESSIONAL SUMMARY")
        pdf.set_font("Helvetica","",10); pdf.set_text_color(55,65,81)
        pdf.multi_cell(0,5,p["summary"]); pdf.ln(4)
    exps = data.get("experience",[])
    if any(e.get("company") or e.get("position") for e in exps):
        _section_hdr(pdf,"EXPERIENCE")
        for e in exps:
            if not e.get("company") and not e.get("position"): continue
            pdf.set_font("Helvetica","B",11); pdf.set_text_color(30,41,59)
            pdf.cell(0,6,f"{e.get('position','')} — {e.get('company','')}",ln=True)
            sub = f"{e.get('startDate','')} – {e.get('endDate','Present')}   {e.get('location','')}".strip()
            pdf.set_font("Helvetica","I",9); pdf.set_text_color(100,116,139); pdf.cell(0,5,sub,ln=True)
            for h in e.get("highlights",[]):
                if h.strip():
                    pdf.set_font("Helvetica","",10); pdf.set_text_color(55,65,81)
                    pdf.multi_cell(0,5,f"  •  {h}")
            pdf.ln(3)
    edus = data.get("education",[])
    if any(e.get("institution") for e in edus):
        _section_hdr(pdf,"EDUCATION")
        for e in edus:
            if not e.get("institution"): continue
            deg = f"{e.get('degree','')} in {e.get('field','')}".strip(" in ")
            pdf.set_font("Helvetica","B",11); pdf.set_text_color(30,41,59); pdf.cell(0,6,deg,ln=True)
            dt = f"{e.get('startDate','')} – {e.get('endDate','')}".strip(" –")
            gpa = f" | GPA: {e['gpa']}" if e.get("gpa") else ""
            pdf.set_font("Helvetica","",10); pdf.set_text_color(100,116,139)
            pdf.cell(0,5,f"{e['institution']}  {dt}{gpa}",ln=True); pdf.ln(2)
    sks = data.get("skills",[])
    if any(s.get("items") for s in sks):
        _section_hdr(pdf,"SKILLS")
        for s in sks:
            items=[i for i in s.get("items",[]) if i.strip()]
            if not items: continue
            pdf.set_font("Helvetica","B",10); pdf.set_text_color(30,41,59); pdf.cell(40,5,f"{s.get('category','')}:")
            pdf.set_font("Helvetica","",10); pdf.set_text_color(55,65,81); pdf.cell(0,5,", ".join(items),ln=True)
        pdf.ln(3)
    projs = data.get("projects",[])
    if any(p.get("name") for p in projs):
        _section_hdr(pdf,"PROJECTS")
        for pr in projs:
            if not pr.get("name"): continue
            pdf.set_font("Helvetica","B",11); pdf.set_text_color(30,41,59); pdf.cell(0,6,pr["name"],ln=True)
            if pr.get("technologies"):
                pdf.set_font("Helvetica","I",9); pdf.set_text_color(100,116,139); pdf.cell(0,5,f"Tech: {pr['technologies']}",ln=True)
            if pr.get("description"):
                pdf.set_font("Helvetica","",10); pdf.set_text_color(55,65,81); pdf.multi_cell(0,5,pr["description"])
            pdf.ln(2)
    certs = data.get("certifications",[])
    if any(c.get("name") for c in certs):
        _section_hdr(pdf,"CERTIFICATIONS")
        for c in certs:
            if not c.get("name"): continue
            line = c["name"]
            if c.get("issuer"): line += f" — {c['issuer']}"
            if c.get("date"): line += f" ({c['date']})"
            pdf.set_font("Helvetica","",10); pdf.set_text_color(30,41,59); pdf.cell(0,6,line,ln=True)
    return bytes(pdf.output())

# ============ ENDPOINTS ============
@router.post("/save")
async def save_resume(req: SaveRequest):
    resumes = _load()
    entry = {
        "id": req.id or str(uuid4()),
        "name": req.name, "template_id": req.template_id,
        "data": req.data.model_dump() if hasattr(req.data,'model_dump') else req.data.dict(),
        "updated_at": datetime.now().isoformat(),
    }
    idx = next((i for i,r in enumerate(resumes) if r["id"]==entry["id"]), None)
    if idx is not None: resumes[idx]=entry
    else: resumes.append(entry)
    _save(resumes)
    return entry

@router.get("/list")
async def list_resumes():
    return _load()

@router.get("/get/{resume_id}")
async def get_resume(resume_id: str):
    r = next((r for r in _load() if r["id"]==resume_id), None)
    if not r: raise HTTPException(404,"Not found")
    return r

@router.delete("/delete/{resume_id}")
async def delete_resume(resume_id: str):
    resumes = [r for r in _load() if r["id"]!=resume_id]; _save(resumes)
    return {"ok": True}

@router.post("/improve")
async def improve_content(req: ImproveRequest):
    if not req.text.strip(): raise HTTPException(400,"Empty text")
    return {"original": req.text, "improved": _improve_text(req.text, req.content_type)}

@router.post("/pdf")
async def generate_pdf(req: SaveRequest):
    data = req.data.model_dump() if hasattr(req.data,'model_dump') else req.data.dict()
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', req.name or 'resume')
    return StreamingResponse(
        io.BytesIO(_gen_pdf(data)), media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={safe_name}.pdf"})
