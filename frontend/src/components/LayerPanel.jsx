import { Eye, EyeOff, Lock, Plus, Check, Layers, MoreVertical, GripVertical } from 'lucide-react';

const defaultLayers = [
  { id: 'layer-1', name: 'Layer 1', visible: true, locked: false },
  { id: 'layer-2', name: 'Layer 2', visible: true, locked: false },
  { id: 'sketch', name: 'Sketch Layer', visible: true, locked: false },
  { id: 'bg', name: 'Background', visible: true, locked: true },
];

export default function LayerPanel({ layers = defaultLayers, activeLayer, onLayerSelect, onLayerVisibilityToggle, onAddLayer }) {
  return (
    <div className="w-[300px] h-full glass-panel border-l border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Layers</span>
        </div>
        <button 
          onClick={onAddLayer} 
          className="w-8 h-8 icon-button bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 shadow-lg active:scale-90 transition-all"
          title="Add Layer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {layers.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => onLayerSelect?.(layer.id)}
              className={`group px-3 py-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-300 border ${
                isActive 
                  ? 'bg-blue-500/20 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
              }`}
            >
              {/* Drag Handle */}
              <div className="text-white/10 group-hover:text-white/30 transition-colors">
                 <GripVertical className="w-4 h-4" />
              </div>

              {/* Icon (Lock or Edit) */}
              <div className={`${isActive ? 'text-blue-400' : 'text-white/20'}`}>
                 {layer.locked ? <Lock className="w-3.5 h-3.5" /> : (isActive ? <div className="w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div> : <div className="w-3.5 h-3.5 border-2 border-white/10 rounded-full"></div>)}
              </div>

              {/* Name */}
              <span className={`flex-1 text-[11px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-blue-100' : 'text-white/40'}`}>
                {layer.name}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle?.(layer.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all ${isActive ? 'text-blue-400 hover:bg-blue-400/20' : 'text-white/30 hover:bg-white/10'}`}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 text-white/20 hover:text-white/60">
                   <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {isActive && !layer.locked && <Check className="w-3.5 h-3.5 text-blue-400 ml-1" strokeWidth={3} />}
            </div>
          );
        })}
      </div>
      
      {/* Bottom Area */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex justify-between items-center px-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Scene Graph</span>
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-blue-500/40" />
            <div className="w-1 h-1 rounded-full bg-blue-500/40" />
            <div className="w-1 h-1 rounded-full bg-blue-500/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
