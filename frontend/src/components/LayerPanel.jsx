import { Eye, Check, Lock, Pencil } from 'lucide-react';

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

  const getLayerIcon = (layer) => {
    if (layer.locked) return <Lock className="w-3.5 h-3.5" />;
    if (layer.type === 'sketch') return <Pencil className="w-3.5 h-3.5" />;
    return <Eye className="w-3.5 h-3.5 opacity-60" />;
  };

  return (
    <div className="w-60 bg-panel rounded-xl shadow-2xl flex flex-col border border-border/20 overflow-hidden">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border/30 bg-toolbar/50">
        <span className="text-foreground font-semibold text-sm tracking-wide">Layers</span>
        <button 
          onClick={onAddLayer}
          className="px-3.5 py-1.5 bg-accent/10 text-accent text-xs rounded-lg hover:bg-accent hover:text-accent-foreground transition-all font-medium border border-accent/20 shadow-sm hover:shadow-md"
        >
          Add +
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 p-2.5 space-y-1.5 overflow-y-auto max-h-80">
        {displayLayers.map((layer) => {
          const isActive = activeLayer === layer.id;
          
          return (
            <div
              key={layer.id}
              onClick={() => !layer.locked && onLayerSelect?.(layer.id)}
              className={cn(
                "h-12 px-3.5 rounded-lg flex items-center justify-between transition-all border",
                layer.locked 
                  ? "bg-transparent text-muted-foreground cursor-default border-border/10" 
                  : isActive
                    ? "bg-accent text-accent-foreground cursor-pointer shadow-lg shadow-accent/20 border-accent/30 scale-[1.02]"
                    : "bg-secondary/30 text-foreground hover:bg-secondary/50 cursor-pointer border-border/20 hover:border-border/40 hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "transition-all",
                  isActive && !layer.locked && "text-accent-foreground"
                )}>
                  {getLayerIcon(layer)}
                </div>
                <span className="text-sm font-medium truncate">{layer.name}</span>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                {/* Visibility Toggle */}
                {!layer.locked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerVisibilityToggle?.(layer.id);
                    }}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      isActive 
                        ? "hover:bg-accent-foreground/10" 
                        : "hover:bg-muted/50"
                    )}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    <Eye className={cn("w-4 h-4 transition-opacity", !layer.visible && "opacity-30")} />
                  </button>
                )}

                {/* Selection Check */}
                {!layer.locked && (
                  <Check 
                    className={cn(
                      "w-4 h-4 transition-all",
                      layer.visible ? "opacity-100" : "opacity-20",
                      isActive && "drop-shadow-sm"
                    )} 
                  />
                )}

                {/* Lock indicator for background */}
                {layer.locked && (
                  <div className="w-4 h-4 flex items-center justify-center opacity-40">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
