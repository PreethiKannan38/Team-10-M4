import { Eye, Check, Lock, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  type?: 'layer' | 'sketch' | 'background';
}

interface LayerPanelProps {
  layers?: Layer[];
  activeLayer?: string | null;
  onLayerSelect?: (id: string) => void;
  onLayerVisibilityToggle?: (id: string) => void;
  onAddLayer?: () => void;
}

const defaultLayers: Layer[] = [
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
}: LayerPanelProps) {
  const displayLayers = layers.length > 0 ? layers : defaultLayers;

  const getLayerIcon = (layer: Layer) => {
    if (layer.locked) return <Lock className="w-3.5 h-3.5" />;
    if (layer.type === 'sketch') return <Pencil className="w-3.5 h-3.5" />;
    return <Eye className="w-3.5 h-3.5 opacity-60" />;
  };

  return (
    <div className="w-56 bg-panel rounded-xl shadow-2xl flex flex-col border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border/30">
        <span className="text-foreground font-semibold text-sm">Layers</span>
        <button 
          onClick={onAddLayer}
          className="px-3 py-1 bg-secondary text-muted-foreground text-xs rounded-md hover:bg-secondary/80 hover:text-foreground transition-all font-medium border border-border/50"
        >
          Add +
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 p-2 space-y-1 overflow-y-auto max-h-80">
        {displayLayers.map((layer) => {
          const isActive = activeLayer === layer.id;
          
          return (
            <div
              key={layer.id}
              onClick={() => !layer.locked && onLayerSelect?.(layer.id)}
              className={cn(
                "h-11 px-3 rounded-lg flex items-center justify-between transition-all",
                layer.locked 
                  ? "bg-transparent text-muted-foreground cursor-default" 
                  : isActive
                    ? "bg-primary text-primary-foreground cursor-pointer shadow-sm"
                    : "bg-secondary/40 text-foreground hover:bg-secondary cursor-pointer"
              )}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {getLayerIcon(layer)}
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
                      isActive ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
                    )}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    <Eye className={cn("w-4 h-4", !layer.visible && "opacity-40")} />
                  </button>
                )}

                {/* Selection Check */}
                {!layer.locked && (
                  <Check 
                    className={cn(
                      "w-4 h-4 transition-opacity",
                      layer.visible ? "opacity-100" : "opacity-30"
                    )} 
                  />
                )}

                {/* Lock indicator for background */}
                {layer.locked && (
                  <div className="w-4 h-4 flex items-center justify-center opacity-50">
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
