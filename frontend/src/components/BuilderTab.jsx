import { useState, useEffect } from 'react';
import { PenTool, ChevronLeft, ChevronRight, Save, Download, Loader, FolderOpen, Trash2 } from 'lucide-react';
import TemplateGallery from './builder/TemplateGallery';
import StepForm from './builder/StepForm';
import ResumePreview from './builder/ResumePreview';
import { templates } from './builder/templates';
import { listBuilderResumes, saveBuilderResume, deleteBuilderResume, downloadBuilderPDF, improveText } from '../services/api';

const STEPS = ['Template', 'Personal', 'Education', 'Experience', 'Skills', 'Projects', 'Certifications'];

const INITIAL = {
  personal: { name: '', title: '', email: '', phone: '', linkedin: '', github: '', location: '', summary: '' },
  education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }],
  experience: [{ company: '', position: '', location: '', startDate: '', endDate: '', current: false, highlights: [''] }],
  skills: [{ category: 'Technical Skills', items: [''] }],
  projects: [{ name: '', description: '', technologies: '', link: '' }],
  certifications: [{ name: '', issuer: '', date: '', link: '' }],
};

export default function BuilderTab() {
  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState(null);
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(INITIAL)));
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [savedList, setSavedList] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [toast, setToast] = useState('');

  const template = templates.find(t => t.id === templateId) || templates[0];

  // Fetch saved resumes on mount
  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    try { const data = await listBuilderResumes(); setSavedList(data); } catch {}
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSelectTemplate = (id) => { setTemplateId(id); setStep(1); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await saveBuilderResume({
        id: savedId, template_id: templateId,
        data: formData, name: formData.personal.name || 'Untitled Resume',
      });
      setSavedId(data.id); fetchSaved(); flash('✓ Resume saved!');
    } catch {} finally { setSaving(false); }
  };

  const handleLoad = (entry) => {
    setFormData(entry.data);
    setTemplateId(entry.template_id);
    setSavedId(entry.id);
    setStep(1); setShowSaved(false);
    flash('Resume loaded');
  };

  const handleDelete = async (id) => {
    try { await deleteBuilderResume(id); fetchSaved(); } catch {}
  };

  const handleNew = () => {
    setFormData(JSON.parse(JSON.stringify(INITIAL)));
    setTemplateId(null); setSavedId(null); setStep(0);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadBuilderPDF({ template_id: templateId, data: formData, name: formData.personal.name || 'resume' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${formData.personal.name || 'resume'}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch {} finally { setDownloading(false); }
  };

  const handleImprove = async (text) => {
    try { const improved = await improveText(text, 'bullet'); return improved; }
    catch { return text; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary" /> Resume Builder
          </h2>
          <p className="text-sm text-theme-muted mt-1">Build with 50+ professional templates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSaved(!showSaved)}
            className="px-3 py-2 rounded-xl text-xs font-medium glass-panel text-theme-secondary hover:text-theme-primary flex items-center gap-1.5 transition-colors">
            <FolderOpen className="w-4 h-4" /> Saved ({savedList.length})
          </button>
          <button onClick={handleNew}
            className="px-3 py-2 rounded-xl text-xs font-medium glass-panel text-theme-secondary hover:text-theme-primary transition-colors">
            + New
          </button>
          {step > 0 && (
            <>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
              <button onClick={handleDownload} disabled={downloading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5">
                {downloading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Saved Resumes Dropdown */}
      {showSaved && savedList.length > 0 && (
        <div className="glass-panel p-4 space-y-2 animate-slide-up">
          <p className="text-xs font-semibold text-theme-muted mb-2">Saved Resumes</p>
          {savedList.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-primary/30 transition-all">
              <button onClick={() => handleLoad(s)} className="text-left flex-1">
                <p className="text-sm font-medium text-theme-primary">{s.name}</p>
                <p className="text-[10px] text-theme-muted">{new Date(s.updated_at).toLocaleDateString()} • {s.template_id}</p>
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => (i === 0 || templateId) && setStep(i)}
            disabled={i > 0 && !templateId}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
              ${step === i ? 'tab-active' : 'text-theme-muted hover:text-theme-secondary disabled:opacity-30'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      {step === 0 ? (
        <TemplateGallery onSelect={handleSelectTemplate} selected={templateId} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <StepForm step={step} data={formData} setData={setFormData} onImprove={handleImprove} />
            {/* Navigation */}
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(s => Math.max(0, s - 1))}
                className="px-4 py-2 rounded-xl text-sm font-medium text-theme-secondary border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < STEPS.length - 1 && (
                <button onClick={() => setStep(s => s + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="xl:sticky xl:top-4 xl:self-start">
            <ResumePreview data={formData} template={template} />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-green-500/90 text-white text-sm font-medium shadow-lg animate-slide-up z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
