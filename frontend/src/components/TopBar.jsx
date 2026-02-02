import { Share2, Download, LogOut, ChevronDown, Bell, Settings } from 'lucide-react';

export default function TopBar({ onClear }) {
  return (
    <div className="w-full h-20 glass-panel border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <div className="w-3 h-3 bg-white/30 rounded-sm -rotate-45"></div>
        </div>
        <span className="font-black text-sm text-white tracking-[0.3em] ml-1 uppercase">
          DrawSpace
        </span>
      </div>

      {/* Center: User Profile Pill - Refined */}
      <div className="flex items-center gap-3 px-1.5 py-1 pr-4 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
        <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 overflow-hidden flex items-center justify-center text-[10px] font-bold text-purple-400">
             MS
        </div>
        <div className="flex flex-col -gap-1">
           <span className="text-[10px] font-bold text-white/80 leading-tight">Manu Santhosh</span>
           <span className="text-[8px] text-white/30 font-black uppercase tracking-widest leading-tight">Pro Plan</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Clear
        </button>

        <button className="w-9 h-9 icon-button text-white/40 hover:text-white hover:bg-white/5">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 icon-button text-white/40 hover:text-white hover:bg-white/5">
          <Settings className="w-4 h-4" />
        </button>
        
        <div className="w-[1px] h-4 bg-white/10 mx-2" />

        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95">
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:block">Share</span>
        </button>
        
        <button className="w-9 h-9 icon-button bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 active:scale-90">
          <Download className="w-4 h-4" />
        </button>

        <button className="w-9 h-9 icon-button text-white/30 hover:text-red-400 hover:bg-red-500/10 active:scale-90 ml-2">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
