import { 
  Pencil, MousePointer2, Eraser, Square, Circle, Minus, Type, 
  PaintBucket, Pipette, Hand, Move, LassoSelect, 
  PenTool, Highlighter, Triangle, Hexagon, ArrowRight,
  Undo2, Redo2, Trash2, Download
} from 'lucide-react';

const toolGroups = [
  {
    id: 'selection',
    label: 'Select',
    color: '#6B7A99', // Muted slate blue
    tools: [
      { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
      { id: 'move', label: 'Move', icon: Move, shortcut: 'M' },
    ]
  },
  {
    id: 'drawing',
    label: 'Draw',
    color: '#7C6AF2', // Soft indigo/purple
    tools: [
      { id: 'draw', label: 'Pen', icon: PenTool, shortcut: 'P' },
      { id: 'pencil', label: 'Pencil', icon: Pencil, shortcut: 'K' },
    ]
  },
  {
    id: 'shapes',
    label: 'Shapes',
    color: '#444A5A', // Neutral charcoal
    tools: [
      { id: 'rectangle', label: 'Rect', icon: Square, shortcut: 'R' },
      { id: 'circle', label: 'Circle', icon: Circle, shortcut: 'O' },
      { id: 'triangle', label: 'Triangle', icon: Triangle, shortcut: 'T' },
      { id: 'polygon', label: 'Poly', icon: Hexagon, shortcut: 'G' },
    ]
  },
  {
    id: 'utility',
    label: 'Utils',
    color: '#444A5A', // Neutral charcoal
    tools: [
      { id: 'fill', label: 'Fill', icon: PaintBucket, shortcut: 'F' },
      { id: 'text', label: 'Text', icon: Type, shortcut: 'T' },
    ]
  },
  {
    id: 'destructive',
    label: 'Destructive',
    color: '#F26D6D', // Restrained coral red
    tools: [
      { id: 'eraser', label: 'Eraser', icon: Eraser, shortcut: 'E' },
      { id: 'clear', label: 'Clear', icon: Trash2, shortcut: 'X' },
    ]
  },
  {
    id: 'editing',
    label: 'Edit',
    color: '#444A5A',
    tools: [
      { id: 'undo', label: 'Undo', icon: Undo2, shortcut: 'Z' },
      { id: 'redo', label: 'Redo', icon: Redo2, shortcut: 'Y' },
      { id: 'export', label: 'Export', icon: Download, shortcut: 'S' },
    ]
  }
];

export default function Toolbar({ activeTool = 'draw', onToolChange, onAction }) {
  const handleToolClick = (tool) => {
    const isAction = ['undo', 'redo', 'clear', 'export'].includes(tool.id);
    if (isAction) {
      onAction?.(tool.id);
    } else {
      onToolChange(tool.id);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-3 flex flex-col gap-5 border border-slate-200 shadow-2xl w-20 items-center py-8 h-fit max-h-[90vh] overflow-y-auto custom-scrollbar">
      {toolGroups.map((group, groupIdx) => (
        <div key={group.id} className="flex flex-col items-center gap-3 w-full">
          {groupIdx > 0 && <div className="w-10 h-[1px] bg-slate-100 my-1" />}
          <div className="flex flex-col items-center gap-2 w-full">
            {group.tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const isAction = ['undo', 'redo', 'clear', 'export'].includes(tool.id);
              const groupColor = group.color;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`group relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all duration-300 ease-out active:scale-90 ${
                    isActive
                      ? 'text-white shadow-[0_8px_20px_rgba(124,106,242,0.3)]' 
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                  style={isActive ? { backgroundColor: groupColor, boxShadow: `0 8px 25px ${groupColor}4D` } : {}}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <Icon 
                    className={`w-[1.4rem] h-[1.4rem] transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  
                  {/* Tooltip Label */}
                  <div className="absolute left-20 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 ease-out z-[100] whitespace-nowrap shadow-xl">
                    {tool.label}
                  </div>

                  {/* Active Halo Effect */}
                  {isActive && !isAction && (
                    <div 
                      className="absolute inset-0 rounded-[1.5rem] opacity-20 animate-pulse"
                      style={{ backgroundColor: groupColor, filter: 'blur(10px)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
