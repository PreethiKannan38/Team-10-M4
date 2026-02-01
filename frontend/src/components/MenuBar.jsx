import { Link2, Download, LogOut, ChevronDown } from 'lucide-react';

export default function MenuBar({ 
  userName = "Manu Santhosh", 
  userRole = "Guest",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Manu"
}) {
  return (
    <header className="h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center justify-between px-6 shadow-lg">
      {/* Left: Logo & App Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DrawSpace</span>
        </div>
      </div>

      {/* Center: User Profile */}
      <div className="flex items-center gap-3 bg-gray-800/60 pl-2 pr-4 py-2 rounded-full border border-gray-700/50 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/30">
          <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
        </div>
        <span className="text-gray-100 text-sm font-medium">{userName}</span>
        <button className="flex items-center gap-1.5 text-gray-400 text-xs hover:text-gray-200 transition-colors">
          <span className="bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-500/30">{userRole}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
          <Link2 className="w-4 h-4" />
          Share
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-gray-100 rounded-full text-sm font-medium hover:bg-gray-600 transition-all shadow-md">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-gray-100 rounded-full text-sm font-medium hover:bg-gray-600 transition-all shadow-md">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </header>
  );
}
