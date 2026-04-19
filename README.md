# AI Resume Coach

A scalable, full-stack application serving as your personal AI resume reviewer and interview coach. Built with a modern tech stack reflecting premium "glassmorphism" design aesthetics.

## Features

- **Resume Analysis**: Upload PDF or DOCX resumes to get instant ATS, readability, and impact scores.
- **Job Description Matching**: See how well your resume matches target roles and identify skill gaps.
- **Mock Interviews**: Practice customized interview questions generated from your resume with instant AI evaluation.
- **Resume Builder**: Choose from 50+ templates (Modern, Minimal, Professional, Creative, Executive) to create and export ATS-friendly A4 PDFs.
- **AI Content Improvement**: Automatically strengthen your resume bullet points using OpenAI.
- **Progress Tracking**: Compare your resume scores over time through interactive charts.
- **PDF Reports**: Export comprehensive analysis insights as professional PDF documents.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Python 3, FastAPI, OpenAI, PyPDF2, python-docx, FPDF2

## Project Structure

```
ai-resume-coach/
├── backend/
│   ├── .env.example       # Environment template
│   ├── main.py            # Analysis, JD Matching & Interview API
│   ├── builder.py         # Resume Builder & Template API
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # UI Views (Tabs, Preview, Builder)
│   │   ├── services/      # Centralized API logic (api.js)
│   │   ├── App.jsx        # Main application state
│   │   └── index.css      # Globals & Glassmorphism theme
│   ├── package.json       # JS dependencies
│   └── tailwind.config.js
└── README.md
```

## Quick Start (VS Code)

### 1. Start the Backend API
1. Open a terminal in VS Code and CD into the backend `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate it: 
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. **CRITICAL**: Copy `.env.example` to `.env` and add your OpenAI API Key.
   ```bash
   cp .env.example .env
   ```
6. Run the server: `uvicorn main:app --reload` (Runs on http://localhost:8000)

### 2. Start the Frontend UI
1. Open a new split terminal in VS Code and CD into the frontend `cd frontend`
2. Install NodeJS packages: `npm install`
3. Start the dev server: `npm run dev` (Runs on http://localhost:5173)

### 3. Open in Browser
Ctrl-click the `http://localhost:5173` link in your frontend terminal to view your new app!

## Screenshots
*(Add your screenshots here)*
- `docs/dashboard.png`
- `docs/builder.png`
- `docs/interview.png`

## License
MIT License.
