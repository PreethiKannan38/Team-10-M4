import { Palette, Maximize2, MoveHorizontal, Zap, Box, MousePointer } from 'lucide-react';

const SAVED_COLORS = [
  '#FFFFFF', '#A1A1AA', '#3F3F46', '#18181B',
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#F43F5E', '#D946EF'
];

export default function Footer({ brushColor, strokeWidth, strokeOpacity, onBrushColorChange, onStrokeWidthChange, onStrokeOpacityChange, fillEnabled, onFillToggle }) {
  return (
    <div className="w-[300px] glass-panel border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="p-5 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Properties</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={onFillToggle}
            className={`w-8 h-8 icon-button border transition-all ${fillEnabled ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}`}
            title="Toggle Shape Fill"
           >
             <Box className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Colors */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Color Palette</span>
            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: brushColor }} />
          </div>
          <div className="grid grid-cols-7 gap-2.5">
            {SAVED_COLORS.map((color, idx) => (
              <button 
                key={color}
                onClick={() => onBrushColorChange?.(color)}
                className={`w-full aspect-square rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${
                  brushColor.toLowerCase() === color.toLowerCase() 
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-110' 
                    : 'border border-white/5 hover:border-white/20'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="relative h-9 w-full rounded-xl overflow-hidden glass-card mt-2 group border border-white/5">
             <input
                type="color"
                value={brushColor}
                onChange={(e) => onBrushColorChange?.(e.target.value)}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer p-0 border-0 bg-transparent opacity-0 z-10"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                 <Zap className="w-3 h-3" />
                 <span>Custom</span>
              </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 pt-2">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Stroke Weight</span>
              <span className="text-[10px] font-mono font-bold text-purple-400">{strokeWidth}px</span>
            </div>
            <input
              type="range" min="1" max="100" value={strokeWidth}
              onChange={(e) => onStrokeWidthChange?.(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Opacity</span>
              <span className="text-[10px] font-mono font-bold text-purple-400">{strokeOpacity}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={strokeOpacity}
              onChange={(e) => onStrokeOpacityChange?.(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex justify-center">
         <div className="flex items-center gap-2 opacity-20">
            <MousePointer className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Smart Context</span>
         </div>
      </div>
    </div>
  );
}
