import React from 'react';
import { Palette } from 'lucide-react';

/**
 * ToolOptionsPanel - Contextual tool controls
 * Displays tool-specific options like brush size, opacity, smoothing
 * Appears below or beside the main toolbar
 */
export default function ToolOptionsPanel({ 
  activeTool = 'draw',
  brushSize = 5,
  opacity = 100,
  color = '#000000',
  onBrushSizeChange,
  onOpacityChange,
  onColorChange,
}) {
  const toolConfigs = {
    draw: {
      title: 'Brush Options',
      options: ['size', 'opacity', 'color'],
    },
    select: {
      title: 'Select Tool',
      options: [],
    },
    eraser: {
      title: 'Eraser Tool',
      options: ['size'],
    },
    line: {
      title: 'Line Tool',
      options: ['size', 'color'],
    },
    rectangle: {
      title: 'Rectangle Tool',
      options: ['size', 'color', 'opacity'],
    },
    circle: {
      title: 'Circle Tool',
      options: ['size', 'color', 'opacity'],
    },
    text: {
      title: 'Text Tool',
      options: ['color'],
    },
    eyedropper: {
      title: 'Color Picker',
      options: [],
    },
    fill: {
      title: 'Fill Tool',
      options: ['color', 'opacity'],
    },
  };

  const config = toolConfigs[activeTool] || toolConfigs.draw;

  const colorPresets = [
    '#000000', // Black
    '#FFFFFF', // White
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#22C55E', // Green
    '#F59E0B', // Orange
    '#A855F7', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange Red
  ];

  if (config.options.length === 0) {
    return null;
  }

  return (
    <div className="bg-toolbar rounded-xl shadow-2xl border border-border/30 w-[280px] p-4">
      {/* Tool Title */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" />
          {config.title}
        </h3>
      </div>

      {/* Options Container */}
      <div className="flex flex-col gap-4">
        {/* Brush Size Slider */}
        {config.options.includes('size') && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">Size</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => onBrushSizeChange?.(parseInt(e.target.value))}
              className="w-full accent-primary"
              aria-label="Brush size"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-foreground font-medium">{brushSize}px</span>
              <div 
                className="rounded-full bg-primary" 
                style={{ 
                  width: `${Math.max(8, Math.min(brushSize, 20))}px`, 
                  height: `${Math.max(8, Math.min(brushSize, 20))}px` 
                }}
              />
            </div>
          </div>
        )}

        {/* Opacity Slider */}
        {config.options.includes('opacity') && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => onOpacityChange?.(parseInt(e.target.value))}
              className="w-full accent-primary"
              aria-label="Opacity"
            />
            <span className="text-xs text-foreground mt-1 block font-medium">{opacity}%</span>
          </div>
        )}

        {/* Color Picker */}
        {config.options.includes('color') && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">Color</label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onColorChange?.(preset)}
                  className="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 shadow-sm"
                  style={{ 
                    backgroundColor: preset, 
                    borderColor: color === preset ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    boxShadow: color === preset ? '0 0 0 2px hsl(var(--primary) / 0.3)' : 'none'
                  }}
                  title={preset}
                  aria-label={`Color: ${preset}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange?.(e.target.value)}
                className="w-12 h-10 rounded-lg border-2 border-border cursor-pointer"
                aria-label="Custom color picker"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onColorChange?.(e.target.value)}
                className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="#000000"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
