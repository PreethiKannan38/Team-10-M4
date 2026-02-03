import { Eye, EyeOff, Lock, Plus, Check, Layers, MoreVertical, GripVertical } from 'lucide-react';

const defaultLayers = [
  { id: 'layer-1', name: 'Layer 1', visible: true, locked: false },
  { id: 'layer-2', name: 'Layer 2', visible: true, locked: false },
  { id: 'sketch', name: 'Sketch Layer', visible: true, locked: false },
  { id: 'bg', name: 'Background', visible: true, locked: true },
];

export default function LayerPanel({ layers = defaultLayers, activeLayer, onLayerSelect, onLayerVisibilityToggle, onAddLayer }) {
  return (
    <div className="w-[300px] h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Layers</span>
        </div>
        <button 
          onClick={onAddLayer} 
          className="w-8 h-8 icon-button bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm active:scale-90 transition-all"
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
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              {/* Drag Handle */}
              <div className="text-slate-200 group-hover:text-slate-400 transition-colors">
                 <GripVertical className="w-4 h-4" />
              </div>

              {/* Icon (Lock or Edit) */}
              <div className={`${isActive ? 'text-blue-600' : 'text-slate-300'}`}>
                 {layer.locked ? <Lock className="w-3.5 h-3.5" /> : (isActive ? <div className="w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div> : <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-full"></div>)}
              </div>

              {/* Name */}
              <span className={`flex-1 text-[11px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-blue-900' : 'text-slate-500'}`}>
                {layer.name}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle?.(layer.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all ${isActive ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-200'}`}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 text-slate-300 hover:text-slate-600">
                   <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {isActive && !layer.locked && <Check className="w-3.5 h-3.5 text-blue-600 ml-1" strokeWidth={3} />}
            </div>
          );
        })}
      </div>
      
      {/* Bottom Area */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-center px-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Scene Graph</span>
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-blue-200" />
            <div className="w-1 h-1 rounded-full bg-blue-200" />
            <div className="w-1 h-1 rounded-full bg-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
