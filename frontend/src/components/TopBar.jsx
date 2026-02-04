import { Share2, Download, LogOut, ChevronDown, Bell, Settings } from 'lucide-react';

export default function TopBar({ onClear }) {
  return (
    <div className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center rotate-45 shadow-[0_4px_10px_rgba(139,92,246,0.3)]">
          <div className="w-3 h-3 bg-white/30 rounded-sm -rotate-45"></div>
        </div>
        <span className="font-black text-sm text-slate-900 tracking-[0.3em] ml-1 uppercase">
          DrawSpace
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Clear
        </button>

        <button className="w-9 h-9 icon-button text-slate-400 hover:text-slate-900 hover:bg-slate-100">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 icon-button text-slate-400 hover:text-slate-900 hover:bg-slate-100">
          <Settings className="w-4 h-4" />
        </button>
        
        <div className="w-[1px] h-4 bg-slate-200 mx-2" />

        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all active:scale-95">
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:block">Share</span>
        </button>
        
        <button className="w-9 h-9 icon-button bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:scale-90">
          <Download className="w-4 h-4" />
        </button>

        <button className="w-9 h-9 icon-button text-slate-300 hover:text-red-600 hover:bg-red-50 active:scale-90 ml-2">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
