import { useState } from 'react';
import { FileDown, CheckCircle, Loader, FileText, BarChart3, MessageSquare, Search } from 'lucide-react';


export default function ReportTab({ analysis, jdMatch, onDownload }) {
  const [downloading, setDownloading] = useState(false);

  if (!analysis) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2 mb-2">
          <FileDown className="w-6 h-6 text-emerald-400" /> Download Report
        </h2>
        <div className="glass-panel p-12 text-center mt-6">
          <FileDown className="w-16 h-16 mx-auto text-theme-muted opacity-30 mb-4" />
          <p className="text-theme-muted">Analyze your resume first to generate a downloadable report.</p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    await onDownload();
    setDownloading(false);
  };

  const sections = [
    { icon: BarChart3, label: 'Score Breakdown', desc: `Overall: ${analysis.scores.overall_score}/100, ATS: ${analysis.scores.ats_score}, Readability: ${analysis.scores.readability_score}, Impact: ${analysis.scores.impact_score}`, color: 'text-blue-400' },
    { icon: CheckCircle, label: 'Improvement Suggestions', desc: `${analysis.suggestions.length} actionable suggestions`, color: 'text-green-400' },
    { icon: FileText, label: 'Detected Skills', desc: analysis.detected_skills.slice(0, 5).join(', ') + (analysis.detected_skills.length > 5 ? '…' : ''), color: 'text-purple-400' },
    { icon: MessageSquare, label: 'Interview Questions', desc: `${analysis.interview_questions.length} tailored questions`, color: 'text-cyan-400' },
  ];

  if (jdMatch) {
    sections.push({
      icon: Search,
      label: 'JD Match Results',
      desc: `Match score: ${jdMatch.match_score}% • ${jdMatch.missing_keywords.length} skill gaps`,
      color: 'text-amber-400',
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
          <FileDown className="w-6 h-6 text-emerald-400" /> Download Report
        </h2>
        <p className="text-sm text-theme-muted mt-1">Generate a comprehensive PDF report of your analysis</p>
      </div>

      {/* Preview of included sections */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-5">Report Preview</h3>
        <div className="space-y-3">
          {sections.map(({ icon: Icon, label, desc, color }, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                    hover:border-primary/30 transition-all duration-200 animate-slide-up"
                 style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`p-2 rounded-lg bg-[var(--bg-card)] ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme-primary">{label}</p>
                <p className="text-xs text-theme-muted mt-0.5 truncate">{desc}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <div className="glass-panel p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
          <FileDown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">Ready to Download</h3>
        <p className="text-sm text-theme-muted mb-6">Your report includes all {sections.length} sections listed above</p>
        <button onClick={handleDownload} disabled={downloading}
          className="px-8 py-3.5 rounded-xl font-semibold text-white text-base
                     bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-green-500/25
                     transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
        >
          {downloading ? (
            <><Loader className="w-5 h-5 animate-spin" /> Generating PDF…</>
          ) : (
            <><FileDown className="w-5 h-5" /> Download PDF Report</>
          )}
        </button>
      </div>
    </div>
  );
}
