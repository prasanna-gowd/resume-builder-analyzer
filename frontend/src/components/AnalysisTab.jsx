import { useState } from 'react';
import { UploadCloud, FileText, Loader, CheckCircle, AlertTriangle, Search, ExternalLink, Sparkles } from 'lucide-react';
import ScoreRing from './ScoreRing';
import ProgressBar from './ProgressBar';

export default function AnalysisTab({ file, setFile, analysis, loading, error, onAnalyze, jdMatch, onMatchJD }) {
  const [jd, setJd] = useState('');
  const [jdLoading, setJdLoading] = useState(false);

  const handleMatch = async () => {
    if (!jd.trim()) return;
    setJdLoading(true);
    await onMatchJD(jd);
    setJdLoading(false);
  };

  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState('');

  const onFileChange = (fileOrNull) => {
    setLocalError('');
    if (!fileOrNull) {
      setFile(null);
      return;
    }
    if (!fileOrNull.name.toLowerCase().match(/\.(pdf|docx)$/)) {
      setLocalError('Only PDF or DOCX files are allowed.');
      return;
    }
    if (fileOrNull.size > 10 * 1024 * 1024) {
      setLocalError('File size exceeds 10MB limit.');
      return;
    }
    setFile(fileOrNull);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Resume Analysis
        </h2>
        <p className="text-sm text-theme-muted mt-1">Upload your resume for a comprehensive AI-powered review</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ====== Upload Panel ====== */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-1">Upload Resume</h3>
            <p className="text-xs text-theme-muted mb-5">PDF or DOCX • Max 10 MB</p>

            <div 
              className={`relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl transition-all duration-300 ${dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'hover:scale-[1.01]'}`}
              style={{ borderColor: dragOver ? '#3b82f6' : (file ? '#3b82f6' : 'var(--border)') }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFileChange(e.dataTransfer.files?.[0]); }}
            >
              <input type="file" id="resume-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.docx" onChange={e => onFileChange(e.target.files?.[0])} />
              
              {!file ? (
                <>
                  <UploadCloud className={`w-10 h-10 mb-3 ${dragOver ? 'text-primary animate-pulse' : 'text-theme-muted'}`} />
                  <span className="text-sm text-theme-secondary text-center px-4">Click or drag file here</span>
                </>
              ) : (
                <div className="flex flex-col items-center z-10 pointer-events-none">
                  <FileText className="w-10 h-10 mb-2 text-primary" />
                  <span className="text-sm font-medium text-theme-primary truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-theme-muted mt-1">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              )}
            </div>

            {file && (
              <button 
                onClick={() => onFileChange(null)}
                className="text-xs text-red-500 font-medium hover:text-red-400 mt-2 block ml-auto transition-colors"
              >
                Remove File
              </button>
            )}

            <button onClick={onAnalyze} disabled={!file || loading}
              className="mt-5 w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                         bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {loading ? 'Analyzing…' : 'Analyze Resume'}
            </button>

            {(error || localError) && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2 animate-slide-up">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error || localError}
              </div>
            )}
          </div>
        </div>

        {/* ====== Results ====== */}
        <div className="xl:col-span-8">
          {!analysis && !loading && (
            <div className="glass-panel h-full min-h-[420px] flex flex-col items-center justify-center text-theme-muted space-y-3">
              <FileText className="w-16 h-16 opacity-30" />
              <p className="text-sm">Upload your resume to see scores, suggestions & interview questions</p>
            </div>
          )}

          {loading && (
            <div className="glass-panel h-full min-h-[420px] flex flex-col items-center justify-center space-y-4">
              <Loader className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-theme-secondary animate-pulse">Parsing & analyzing your resume…</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6 animate-slide-up">
              {/* Scores */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-6">Score Overview</h3>
                <div className="flex flex-wrap items-center justify-around gap-6">
                  <div className="text-center">
                    <ScoreRing score={analysis.scores.overall_score} size={140} />
                    <p className="mt-2 font-bold text-theme-primary">Overall Grade: {analysis.scores.overall_score >= 80 ? 'A' : analysis.scores.overall_score >= 60 ? 'B' : analysis.scores.overall_score >= 40 ? 'C' : 'F'}</p>
                    <p className="text-xs text-theme-muted mt-1 max-w-[150px] mx-auto">Weighted average of all your resume metrics.</p>
                  </div>
                  <div className="flex-1 min-w-[250px] space-y-4">
                    <div>
                      <ProgressBar value={analysis.scores.ats_score} label="ATS Compatibility" />
                      <p className="text-[10px] text-theme-muted mt-1">Measures formatting, contact info, and parseability.</p>
                    </div>
                    <div>
                      <ProgressBar value={analysis.scores.readability_score} label="Readability" />
                      <p className="text-[10px] text-theme-muted mt-1">Evaluates sentence length and structure.</p>
                    </div>
                    <div>
                      <ProgressBar value={analysis.scores.impact_score} label="Impact" />
                      <p className="text-[10px] text-theme-muted mt-1">Detects measurable achievements and action verbs.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Skills */}
              {analysis.detected_skills.length > 0 && (
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.detected_skills.map((sk, i) => (
                      <span key={i} className="skill-chip">{sk}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Improvement Suggestions
                </h3>
                <ul className="space-y-3">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-theme-secondary leading-relaxed p-3 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* JD Matching */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent" /> Job Description Matching
                </h3>
                <p className="text-xs text-theme-muted mb-4">Paste a job description to see how well your resume matches</p>
                <textarea
                  value={jd} onChange={e => setJd(e.target.value)}
                  placeholder="Paste job description here…"
                  rows={4}
                  className="w-full p-3 rounded-xl text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-theme-primary
                             placeholder:text-theme-muted focus:outline-none focus:border-primary resize-none transition-colors"
                />
                <button onClick={handleMatch} disabled={!jd.trim() || jdLoading}
                  className="mt-3 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                             bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/20
                             transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
                             flex items-center gap-2"
                >
                  {jdLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {jdLoading ? 'Matching…' : 'Match'}
                </button>

                {jdMatch && (
                  <div className="mt-6 space-y-5 animate-slide-up">
                    {/* Match Score */}
                    <div className="flex items-center gap-6">
                      <ScoreRing score={jdMatch.match_score} size={100} label="Match %" />
                      <div>
                        <p className="text-sm text-theme-secondary">
                          <span className="font-semibold text-green-400">{jdMatch.matched_keywords.length}</span> matched •{' '}
                          <span className="font-semibold text-red-400">{jdMatch.missing_keywords.length}</span> missing
                        </p>
                      </div>
                    </div>

                    {/* Matched */}
                    {jdMatch.matched_keywords.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-400 mb-2">✓ Matched Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {jdMatch.matched_keywords.map((k, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-green-500/10 border border-green-500/30 text-green-400">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing */}
                    {jdMatch.missing_keywords.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-400 mb-2">✗ Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {jdMatch.missing_keywords.map((k, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 border border-red-500/30 text-red-400">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skill Gaps with Resources */}
                    {jdMatch.skill_gaps.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-400 mb-2">📚 Learning Resources</p>
                        <ul className="space-y-2">
                          {jdMatch.skill_gaps.map((g, i) => (
                            <li key={i} className="text-sm text-theme-secondary p-2.5 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-between">
                              <span><strong className="text-theme-primary">{g.skill}</strong> — {g.suggestion}</span>
                              {g.resource && (
                                <a href={g.resource} target="_blank" rel="noreferrer"
                                   className="ml-2 text-primary hover:text-blue-400 flex-shrink-0">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
