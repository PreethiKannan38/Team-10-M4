import { useState } from 'react';
import { Pencil, MousePointer2, Eraser, Square, Circle, Type, Minus, ChevronDown, ChevronUp, Pipette, PaintBucket } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const primaryTools = [
  { id: 'draw', label: 'Draw', icon: Pencil },
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'eraser', label: 'Erase', icon: Eraser },
];

const secondaryTools = [
  { id: 'line', label: 'Line', icon: Minus },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'eyedropper', label: 'Eyedropper', icon: Pipette },
  { id: 'fill', label: 'Fill', icon: PaintBucket },
];

export default function Toolbar({ activeTool = 'draw', onToolChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderToolButton = (tool) => {
    const Icon = tool.icon;
    const isActive = activeTool === tool.id;
    
    return (
      <button
        key={tool.id}
        onClick={() => onToolChange?.(tool.id)}
        className={cn(
          "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg transition-all text-left group",
          isActive 
            ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30 scale-[1.02]" 
            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:shadow-md"
        )}
        title={tool.label}
      >
        <Icon 
          className={cn(
            "w-[18px] h-[18px] transition-all",
            isActive ? "stroke-[2.5]" : "stroke-[2] group-hover:stroke-[2.3]"
          )} 
        />
        <span className={cn(
          "text-sm font-medium transition-all",
          isActive && "font-semibold"
        )}>
          {tool.label}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-toolbar rounded-xl shadow-2xl p-2.5 flex flex-col gap-1 w-[136px] border border-border/20">
      {/* macOS-style window controls */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 mb-1.5 border-b border-border/30">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/80 hover:bg-destructive transition-colors cursor-pointer" />
        <div className="w-2.5 h-2.5 rounded-full hover:opacity-100 transition-opacity cursor-pointer" style={{ background: 'hsl(45 93% 47%)', opacity: 0.8 }} />
        <div className="w-2.5 h-2.5 rounded-full bg-success/80 hover:bg-success transition-colors cursor-pointer" />
      </div>

      {/* Primary Tools Section */}
      <div className="flex flex-col gap-1 pb-2 border-b border-border/30">
        {primaryTools.map(renderToolButton)}
      </div>

      {/* Secondary tools (shown when expanded) */}
      {isExpanded && (
        <div className="flex flex-col gap-1 pt-1">
          {secondaryTools.map(renderToolButton)}
        </div>
      )}

      {/* Expand/Collapse button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 pt-2 border-t border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all py-2 rounded-lg"
        title={isExpanded ? "Show less tools" : "Show more tools"}
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
}
