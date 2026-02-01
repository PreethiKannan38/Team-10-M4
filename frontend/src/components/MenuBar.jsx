import { Link2, Download, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';

export default function MenuBar({ 
  userName = "Manu Santhosh", 
  userRole = "Guest",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Manu",
  onBack
}) {
  return (
    <header className="h-14 bg-header flex items-center justify-between px-4 border-b border-border/20">
      {/* Left: Back Button & Logo */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors" 
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="text-foreground font-semibold text-base tracking-tight">DrawSpace</span>
        </div>
      </div>

      {/* Center: User Profile */}
      <div className="flex items-center gap-2.5 bg-secondary/40 pl-1.5 pr-3 py-1 rounded-full border border-border/30">
        <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary/20">
          <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
        </div>
        <span className="text-foreground text-sm font-medium">{userName}</span>
        <button className="flex items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground transition-colors">
          <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-md text-xs font-medium border border-accent/20">{userRole}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
          <Link2 className="w-4 h-4" />
          Share
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-foreground rounded-lg text-sm font-medium hover:bg-secondary/70 transition-all border border-border/30">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-foreground rounded-lg text-sm font-medium hover:bg-secondary/70 transition-all border border-border/30">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </header>
  );
}
