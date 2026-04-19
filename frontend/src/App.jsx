import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisTab from './components/AnalysisTab';
import InterviewTab from './components/InterviewTab';
import HistoryTab from './components/HistoryTab';
import ReportTab from './components/ReportTab';
import BuilderTab from './components/BuilderTab';
import api, { fetchHistory, analyzeResume, matchJobDescription, downloadReport } from './services/api';
import Toast, { createToast } from './components/Toast';
export default function App() {
  // ---- State ----
  const [activeTab, setActiveTab] = useState('analysis');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jdMatch, setJdMatch] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);

  // ---- Toast helpers ----
  const addToast = (msg, type) => setToasts(prev => [...prev, createToast(msg, type)]);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ---- Theme ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  // ---- History fetch ----
  const loadHistory = async () => {
    try { const data = await fetchHistory(); setHistory(data); } catch {}
  };
  useEffect(() => { loadHistory(); }, []);

  // ---- Analyze ----
  const handleAnalyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await analyzeResume(file);
      setAnalysis(data);
      setJdMatch(null); // reset JD match for new resume
      loadHistory();
      addToast('Resume analyzed successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---- JD Match ----
  const matchJD = async (jobDescription) => {
    if (!analysis?.resume_text) return;
    try {
      const data = await matchJobDescription(analysis.resume_text, jobDescription);
      setJdMatch(data);
      addToast('Job description matched!', 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'JD matching failed.';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  // ---- Report Download ----
  const handleDownloadReport = async () => {
    if (!analysis) return;
    try {
      const blob = await downloadReport({
        filename: file?.name || 'resume',
        suggestions: analysis.suggestions,
        interview_questions: analysis.interview_questions,
        scores: analysis.scores,
        detected_skills: analysis.detected_skills,
        missing_sections: analysis.missing_sections,
        jd_match: jdMatch || null,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume_coach_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast('Report downloaded successfully!', 'success');
    } catch (err) {
      setError('Failed to generate report.');
      addToast('Failed to generate report.', 'error');
    }
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }}
        theme={theme}
        toggleTheme={toggleTheme}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main className="lg:ml-72 min-h-screen p-5 md:p-8 lg:p-10 transition-all duration-300">
        {activeTab === 'analysis' && (
          <AnalysisTab
            file={file} setFile={setFile}
            analysis={analysis} loading={loading} error={error}
            onAnalyze={handleAnalyze}
            jdMatch={jdMatch} onMatchJD={matchJD}
          />
        )}
        {activeTab === 'builder' && (
          <BuilderTab />
        )}
        {activeTab === 'interview' && (
          <InterviewTab analysis={analysis} resumeText={analysis?.resume_text || ''} addToast={addToast} />
        )}
        {activeTab === 'history' && (
          <HistoryTab history={history} />
        )}
        {activeTab === 'report' && (
          <ReportTab analysis={analysis} jdMatch={jdMatch} onDownload={handleDownloadReport} />
        )}
      </main>
    </>
  );
}
