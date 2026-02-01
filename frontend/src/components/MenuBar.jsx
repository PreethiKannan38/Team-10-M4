import { Link2, Download, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';

export default function MenuBar({ 
  userName = "Manu Santhosh", 
  userRole = "Guest",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Manu",
  onBack
}) {
  return (
    <header className="h-12 bg-header flex items-center justify-between px-3 rounded-t-xl border-b border-border/30">
      {/* Left: Back Button & Logo */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors" 
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="text-foreground font-semibold text-sm tracking-tight">DrawSpace</span>
        </div>
      </div>

      {/* Center: User Profile */}
      <div className="flex items-center gap-2 bg-secondary/60 pl-1 pr-2.5 py-0.5 rounded-full">
        <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-border/50">
          <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
        </div>
        <span className="text-foreground text-sm font-medium">{userName}</span>
        <button className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground transition-colors">
          <span className="bg-secondary px-1.5 py-0.5 rounded text-xs font-medium">{userRole}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
          <Link2 className="w-3.5 h-3.5" />
          Share
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all border border-border/50">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all border border-border/50">
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
    </header>
  );
}
