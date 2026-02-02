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
    tools: [
      { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
      { id: 'move', label: 'Move', icon: Move, shortcut: 'M' },
      { id: 'lasso', label: 'Lasso', icon: LassoSelect, shortcut: 'L' },
    ]
  },
  {
    id: 'drawing',
    label: 'Draw',
    tools: [
      { id: 'draw', label: 'Pen', icon: PenTool, shortcut: 'P' },
      { id: 'pencil', label: 'Pencil', icon: Pencil, shortcut: 'K' },
      { id: 'brush', label: 'Brush', icon: Highlighter, shortcut: 'B' },
    ]
  },
  {
    id: 'shapes',
    label: 'Shapes',
    tools: [
      { id: 'rectangle', label: 'Rect', icon: Square, shortcut: 'R' },
      { id: 'circle', label: 'Circle', icon: Circle, shortcut: 'O' },
      { id: 'triangle', label: 'Triangle', icon: Triangle, shortcut: 'T' },
      { id: 'polygon', label: 'Poly', icon: Hexagon, shortcut: 'G' },
      { id: 'line', label: 'Line', icon: Minus, shortcut: 'U' },
      { id: 'arrow', label: 'Arrow', icon: ArrowRight, shortcut: 'A' },
    ]
  },
  {
    id: 'utility',
    label: 'Utils',
    tools: [
      { id: 'eraser', label: 'Eraser', icon: Eraser, shortcut: 'E' },
      { id: 'fill', label: 'Fill', icon: PaintBucket, shortcut: 'F' },
      { id: 'eyedropper', label: 'Picker', icon: Pipette, shortcut: 'I' },
    ]
  },
  {
    id: 'editing',
    label: 'Edit',
    tools: [
      { id: 'undo', label: 'Undo', icon: Undo2, shortcut: 'Z' },
      { id: 'redo', label: 'Redo', icon: Redo2, shortcut: 'Y' },
      { id: 'clear', label: 'Clear', icon: Trash2, shortcut: 'X' },
      { id: 'export', label: 'Export', icon: Download, shortcut: 'S' },
    ]
  }
];

export default function Toolbar({ activeTool = 'draw', onToolChange, onAction }) {
  const handleToolClick = (tool) => {
    // Check if it's an action or a persistent tool
    const isAction = ['undo', 'redo', 'clear', 'export'].includes(tool.id);
    if (isAction) {
      onAction?.(tool.id);
    } else {
      onToolChange(tool.id);
    }
  };

  return (
    <div className="glass-panel rounded-[2.5rem] p-3 flex flex-col gap-5 border-white/5 shadow-2xl w-20 items-center py-8 h-fit max-h-[90vh] overflow-y-auto custom-scrollbar">
      {toolGroups.map((group, groupIdx) => (
        <div key={group.id} className="flex flex-col items-center gap-3 w-full">
          {groupIdx > 0 && <div className="w-10 h-[1px] bg-white/10 my-1" />}
          <div className="flex flex-col items-center gap-2 w-full">
            {group.tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const isAction = ['undo', 'redo', 'clear', 'export'].includes(tool.id);

              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`group relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all duration-300 ease-out active:scale-90 ${
                    isActive
                      ? 'bg-[#8b5cf6] text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]' 
                      : 'text-white/30 hover:text-white/90 hover:bg-white/5'
                  }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <Icon 
                    className={`w-[1.4rem] h-[1.4rem] transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'}`} 
                    strokeWidth={isActive ? 2.5 : 1.8} 
                  />
                  
                  {/* Tooltip Label (Snappy Modern Style) */}
                  <div className="absolute left-20 px-3 py-1.5 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-[100] whitespace-nowrap shadow-2xl">
                    {tool.label}
                  </div>

                  {/* Active Indicator Dot */}
                  {isActive && !isAction && (
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-1.5 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_#a78bfa]" />
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
