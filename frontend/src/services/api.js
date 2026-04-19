/**
 * Centralized API service — single source of truth for backend URL and all API calls.
 * Eliminates duplicate `const API` declarations across components.
 */
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// ---- Axios instance with defaults ----
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s timeout for large file uploads
});

// ---- Resume Analysis ----

/** Upload and analyze a resume file (PDF/DOCX). */
export async function analyzeResume(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/analyze', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Match resume text against a job description. */
export async function matchJobDescription(resumeText, jobDescription) {
  const { data } = await api.post('/match-jd', {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return data;
}

/** Evaluate an interview answer. */
export async function evaluateInterview(question, answer, resumeContext = '') {
  const { data } = await api.post('/interview/evaluate', {
    question,
    answer,
    resume_context: resumeContext,
  });
  return data;
}

/** Fetch analysis history. */
export async function fetchHistory() {
  const { data } = await api.get('/history');
  return data;
}

/** Download PDF report — returns a Blob. */
export async function downloadReport(payload) {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Report generation failed');
  return res.blob();
}

// ---- Builder ----

/** List saved resumes. */
export async function listBuilderResumes() {
  const { data } = await api.get('/builder/list');
  return data;
}

/** Save a builder resume. */
export async function saveBuilderResume(payload) {
  const { data } = await api.post('/builder/save', payload);
  return data;
}

/** Delete a builder resume. */
export async function deleteBuilderResume(id) {
  await api.delete(`/builder/delete/${id}`);
}

/** Improve text with AI. */
export async function improveText(text, contentType = 'bullet') {
  const { data } = await api.post('/builder/improve', { text, content_type: contentType });
  return data.improved;
}

/** Generate builder PDF — returns a Blob. */
export async function downloadBuilderPDF(payload) {
  const res = await fetch(`${API_BASE}/builder/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('PDF generation failed');
  return res.blob();
}

export default api;
