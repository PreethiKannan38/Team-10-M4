import { Search, Layers, Activity } from 'lucide-react';

export default function StatusBar({
  zoom = 100,
  cursorX = 0,
  cursorY = 0,
  isConnected = true,
  totalElements = 0,
}) {
  return (
    <footer className="h-9 bg-card border-t border-border/50 px-4 flex items-center justify-between text-xs text-muted-foreground">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span className="font-medium">{zoom}%</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          <span className="font-medium">{totalElements} objects</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2 font-mono text-muted-foreground/70">
        <span>X: {cursorX}</span>
        <span className="text-border">•</span>
        <span>Y: {cursorY}</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isConnected ? 'bg-success' : 'bg-muted-foreground/50'
            }`}
          />
          <span className={isConnected ? 'text-success' : ''}>
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span className="font-medium">60 fps</span>
        </div>
      </div>
    </footer>
  );
}
