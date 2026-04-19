import { useState, useRef } from 'react';
import { MessageSquare, Send, Loader, ChevronRight, SkipForward, Lightbulb, RotateCcw, RefreshCw, User, Bot } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { evaluateInterview } from '../services/api';

export default function InterviewTab({ analysis, resumeText, addToast }) {
  const questions = analysis?.interview_questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // track all Q&A pairs
  const isSubmitting = useRef(false);

  // No analysis → prompt
  if (!analysis) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-secondary" /> Mock Interview
        </h2>
        <div className="glass-panel p-12 text-center mt-6">
          <MessageSquare className="w-16 h-16 mx-auto text-theme-muted opacity-30 mb-4" />
          <p className="text-theme-muted">Analyze your resume first to generate interview questions.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || 'No more questions.';
  const isLast = currentIdx >= questions.length - 1;

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    try {
      const data = await evaluateInterview(currentQ, answer, resumeText);
      setEvaluation(data);
      setHistory(prev => [...prev, { question: currentQ, answer, evaluation: data }]);
    } catch (e) {
      setEvaluation(null);
      if (addToast) addToast("Failed to evaluate answer.", "error");
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleNext = () => {
    if (isLast) return;
    setCurrentIdx(i => i + 1);
    setAnswer('');
    setEvaluation(null);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleTryAgain = () => {
    setEvaluation(null);
    // remove the last entry from history since we are trying again
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswer('');
    setEvaluation(null);
    setHistory([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-secondary" /> Mock Interview
          </h2>
          <p className="text-sm text-theme-muted mt-1">Practice answering tailored questions and get instant feedback</p>
        </div>
        <button onClick={handleRestart} className="text-xs text-theme-muted hover:text-primary transition-colors flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i < currentIdx ? 'bg-green-500' : i === currentIdx ? 'bg-primary' : 'bg-[var(--border)]'
          }`} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question + Answer */}
        <div className="space-y-4">
          {/* Question card */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>
            <p className="text-theme-primary font-medium leading-relaxed">{currentQ}</p>
          </div>

          {/* Answer area */}
          <div className="glass-panel p-6">
            <label className="text-sm font-semibold text-theme-secondary mb-2 block">Your Answer</label>
            <textarea
              value={answer} onChange={e => setAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer here… Be specific and use examples."
              className="w-full p-3 rounded-xl text-sm bg-[var(--bg-secondary)] border border-[var(--border)]
                         text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-primary
                         resize-none transition-colors"
              disabled={!!evaluation}
            />
            <div className="flex gap-3 mt-4">
              {!evaluation ? (
                <>
                  <button onClick={handleSubmit} disabled={!answer.trim() || loading}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm
                               bg-gradient-to-r from-primary to-secondary hover:shadow-lg
                               transition-all disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Evaluating…' : 'Submit Answer'}
                  </button>
                  <button onClick={handleSkip} disabled={isLast}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-theme-secondary border border-[var(--border)]
                               hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 flex items-center gap-1"
                  >
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleTryAgain} disabled={loading}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-theme-secondary border border-[var(--border)]
                               hover:bg-[var(--bg-card-hover)] transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                  <button onClick={handleNext} disabled={isLast}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm
                               bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg
                               transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isLast ? 'Finish Interview' : 'Next Question'} <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation panel */}
        <div>
          {!evaluation && !loading && (
            <div className="glass-panel h-full min-h-[300px] flex flex-col items-center justify-center text-theme-muted space-y-3">
              <Lightbulb className="w-12 h-12 opacity-30" />
              <p className="text-sm text-center px-6">Submit your answer to receive detailed feedback on confidence, clarity, and relevance.</p>
            </div>
          )}

          {loading && (
            <div className="glass-panel h-full min-h-[300px] flex flex-col items-center justify-center space-y-4">
              <Loader className="w-10 h-10 text-secondary animate-spin" />
              <p className="text-sm text-theme-secondary animate-pulse">Evaluating your response…</p>
            </div>
          )}

          {evaluation && (
            <div className="space-y-4 animate-slide-up">
              {/* User Answer Display */}
              <div className="glass-panel p-6 border-l-4 border-l-primary">
                <h4 className="text-sm font-semibold text-theme-primary mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-theme-secondary" /> Your Answer
                </h4>
                <p className="text-sm text-theme-secondary italic">"{answer}"</p>
              </div>

              {/* Scores */}
              <div className="glass-panel p-6 border-l-4 border-l-secondary">
                <h4 className="text-sm font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-theme-secondary" /> AI Evaluation
                </h4>
                <ProgressBar value={evaluation.confidence_score} label="Confidence" />
                <ProgressBar value={evaluation.clarity_score} label="Clarity" />
                <ProgressBar value={evaluation.relevance_score} label="Relevance" />
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-sm font-semibold text-theme-secondary">Overall</span>
                  <span className={`text-2xl font-bold ${
                    evaluation.overall_score >= 70 ? 'text-green-400' : evaluation.overall_score >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {evaluation.overall_score}%
                  </span>
                </div>
              </div>

              {/* Feedback */}
              <div className="glass-panel p-6">
                <h4 className="text-sm font-semibold text-theme-primary mb-3">💬 Feedback</h4>
                <p className="text-sm text-theme-secondary leading-relaxed">{evaluation.feedback}</p>
              </div>

              {/* Tips */}
              <div className="glass-panel p-6">
                <h4 className="text-sm font-semibold text-theme-primary mb-3">💡 Improvement Tips</h4>
                <ul className="space-y-2">
                  {evaluation.improvement_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-theme-secondary flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Past Q&A history in this session */}
      {history.length > 1 && (
        <div className="glass-panel p-6 mt-4">
          <h4 className="text-sm font-semibold text-theme-primary mb-4">Session Summary ({history.length} answered)</h4>
          <div className="space-y-3">
            {history.slice(0, -1).map((h, i) => (
              <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] text-sm">
                <p className="font-medium text-theme-primary mb-1">Q{i + 1}: {h.question}</p>
                <p className="text-theme-muted text-xs">Score: {h.evaluation.overall_score}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
