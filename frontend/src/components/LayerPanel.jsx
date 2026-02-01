import { Eye, EyeOff, Lock, Plus } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const defaultLayers = [
  { id: 'layer-1', name: 'Layer 1', visible: true, type: 'layer' },
  { id: 'layer-2', name: 'Layer 2', visible: true, type: 'layer' },
  { id: 'sketch-layer', name: 'Sketch Layer', visible: true, type: 'sketch' },
  { id: 'background', name: 'Background', visible: false, locked: true, type: 'background' },
];

export default function LayerPanel({
  layers = defaultLayers,
  activeLayer = 'sketch-layer',
  onLayerSelect,
  onLayerVisibilityToggle,
  onAddLayer,
}) {
  const displayLayers = layers.length > 0 ? layers : defaultLayers;

  return (
    <div className="w-64 bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700/50">
        <span className="text-white font-semibold text-sm">Layers</span>
        <button 
          onClick={onAddLayer}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-all font-medium shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Layer
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-96">
        {displayLayers.map((layer) => {
          const isActive = activeLayer === layer.id;
          
          return (
            <div
              key={layer.id}
              onClick={() => !layer.locked && onLayerSelect?.(layer.id)}
              className={cn(
                "px-3 py-2.5 rounded-lg flex items-center justify-between transition-all",
                layer.locked 
                  ? "bg-gray-900/50 text-gray-500 cursor-default" 
                  : isActive
                    ? "bg-blue-600 text-white cursor-pointer shadow-md"
                    : "bg-gray-700/50 text-gray-200 hover:bg-gray-700 cursor-pointer"
              )}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {layer.locked && <Lock className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{layer.name}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Visibility Toggle */}
                {!layer.locked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerVisibilityToggle?.(layer.id);
                    }}
                    className={cn(
                      "p-1 rounded transition-all",
                      isActive 
                        ? "hover:bg-blue-700" 
                        : "hover:bg-gray-600"
                    )}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 opacity-40" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
