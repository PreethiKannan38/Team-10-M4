import { Search, Layers, Activity } from 'lucide-react';

export default function StatusBar({
  zoom = 100,
  cursorX = 0,
  cursorY = 0,
  isConnected = true,
  totalElements = 0,
}) {
  return (
    <footer className="h-10 bg-toolbar/50 border-t border-border/20 px-4 flex items-center justify-between text-xs text-muted-foreground backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-secondary/30 rounded-md border border-border/20">
          <Search className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold text-foreground">{zoom}%</span>
        </div>
        <div className="w-px h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium">{totalElements} objects</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2 font-mono text-muted-foreground/80 text-[11px] px-3 py-1 bg-secondary/20 rounded-md border border-border/10">
        <span>X: {cursorX}</span>
        <span className="text-border/70">•</span>
        <span>Y: {cursorY}</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-secondary/30 rounded-md border border-border/20">
          <div
            className={`w-2 h-2 rounded-full transition-colors shadow-sm ${
              isConnected ? 'bg-success shadow-success/50' : 'bg-muted-foreground/50'
            }`}
          />
          <span className={`font-medium ${isConnected ? 'text-success' : 'text-muted-foreground'}`}>
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
        <div className="w-px h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold text-foreground">60 fps</span>
        </div>
      </div>
    </footer>
  );
}
