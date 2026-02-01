import { Pencil, MousePointer2, Eraser } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const tools = [
  { id: 'draw', label: 'Draw', icon: Pencil },
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'eraser', label: 'Erase', icon: Eraser },
];

export default function Toolbar({ activeTool = 'draw', onToolChange }) {
  const renderToolButton = (tool) => {
    const Icon = tool.icon;
    const isActive = activeTool === tool.id;
    
    return (
      <button
        key={tool.id}
        onClick={() => onToolChange?.(tool.id)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left w-full",
          isActive 
            ? "bg-blue-600 text-white shadow-lg" 
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        )}
        title={tool.label}
      >
        <Icon 
          className={cn(
            "w-5 h-5 transition-all",
            isActive ? "stroke-[2.5]" : "stroke-[2]"
          )} 
        />
        <span className={cn(
          "text-sm font-medium",
          isActive && "font-semibold"
        )}>
          {tool.label}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-40 border border-gray-700/50">
      {tools.map(renderToolButton)}
    </div>
  );
}
