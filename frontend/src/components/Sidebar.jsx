import { BarChart3, MessageSquare, Clock, FileDown, PenTool, Sun, Moon, Zap, Menu, X } from 'lucide-react';

const tabs = [
  { id: 'analysis',  label: 'Analysis',  icon: BarChart3 },
  { id: 'builder',   label: 'Builder',   icon: PenTool },
  { id: 'interview', label: 'Interview', icon: MessageSquare },
  { id: 'history',   label: 'History',   icon: Clock },
  { id: 'report',    label: 'Report',    icon: FileDown },
];

export default function Sidebar({ activeTab, setActiveTab, theme, toggleTheme, open, setOpen }) {
  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-panel"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay on mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">AI Resume</h1>
            <p className="text-xs text-theme-muted -mt-0.5">Coach & Interviewer</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === id
                  ? 'tab-active'
                  : 'text-theme-secondary hover:bg-[var(--bg-card-hover)] hover:text-theme-primary'
                }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-4 pb-6">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-theme-secondary
                       hover:bg-[var(--bg-card-hover)] transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <p className="text-[10px] text-theme-muted text-center mt-4 opacity-60">v2.0 • AI Resume Coach</p>
        </div>
      </aside>
    </>
  );
}
