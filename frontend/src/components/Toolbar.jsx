import { Pencil, MousePointer2, Eraser, ChevronDown } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const tools = [
  { id: 'draw', label: 'Draw', icon: Pencil },
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'eraser', label: 'Erase', icon: Eraser },
];

export default function Toolbar({ activeTool = 'draw', onToolChange }) {
  return (
    <div className="bg-toolbar rounded-xl shadow-2xl p-2 flex flex-col gap-1 w-[120px] border border-border/30">
      {/* macOS-style window controls */}
      <div className="flex items-center gap-1.5 px-2 py-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full opacity-80 bg-destructive" />
        <div className="w-2.5 h-2.5 rounded-full opacity-80" style={{ background: 'hsl(45 93% 47%)' }} />
        <div className="w-2.5 h-2.5 rounded-full opacity-80 bg-success" />
        <div className="flex-1 h-0.5 bg-muted/50 rounded ml-2" />
      </div>

      {/* Tool buttons */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange?.(tool.id)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-sm font-medium">{tool.label}</span>
          </button>
        );
      })}

      {/* Expand button */}
      <button className="mt-1 pt-2 border-t border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors py-2">
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
