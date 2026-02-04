import { Palette, Maximize2, MoveHorizontal, Zap, Box, MousePointer } from 'lucide-react';

const SAVED_COLORS = [
  '#FFFFFF', '#A1A1AA', '#3F3F46', '#18181B',
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#F43F5E', '#D946EF'
];

export default function Footer({ brushColor, strokeWidth, strokeOpacity, gridOpacity, onBrushColorChange, onStrokeWidthChange, onStrokeOpacityChange, onGridOpacityChange, fillEnabled, onFillToggle }) {
  return (
    <div className="w-[300px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-900">Properties</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={onFillToggle}
            className={`w-10 h-10 icon-button border transition-all ${fillEnabled ? 'bg-purple-100 border-purple-300 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}`}
            title="Toggle Shape Fill"
           >
             <Box className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="p-6 space-y-10">
        {/* Colors */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Color Palette</span>
            <div className="w-5 h-5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: brushColor }} />
          </div>
          <div className="grid grid-cols-7 gap-3">
            {SAVED_COLORS.map((color, idx) => (
              <button 
                key={color}
                onClick={() => onBrushColorChange?.(color)}
                className={`w-full aspect-square rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${
                  brushColor.toLowerCase() === color.toLowerCase() 
                    ? 'ring-2 ring-purple-600 ring-offset-2 ring-offset-white scale-110' 
                    : 'border border-slate-200 hover:border-slate-400'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="relative h-11 w-full rounded-xl overflow-hidden bg-slate-50 mt-3 group border-2 border-slate-200 hover:border-slate-300 transition-colors">
             <input
                type="color"
                value={brushColor}
                onChange={(e) => onBrushColorChange?.(e.target.value)}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer p-0 border-0 bg-transparent opacity-0 z-10"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">
                 <Zap className="w-4 h-4" />
                 <span>Custom Picker</span>
              </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-8 pt-2">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Stroke Weight</span>
              <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{strokeWidth}px</span>
            </div>
            <input
              type="range" min="1" max="100" value={strokeWidth}
              onChange={(e) => onStrokeWidthChange?.(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Opacity</span>
              <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{strokeOpacity}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={strokeOpacity}
              onChange={(e) => onStrokeOpacityChange?.(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Grid Visibility</span>
              <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{gridOpacity}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={gridOpacity}
              onChange={(e) => onGridOpacityChange?.(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-center">
         <div className="flex items-center gap-3 opacity-60">
            <MousePointer className="w-4 h-4 text-slate-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Smart Context</span>
         </div>
      </div>
    </div>
  );
}
