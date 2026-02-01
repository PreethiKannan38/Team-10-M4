import React, { useState } from 'react';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Hide panel for tools with no options
  if (config.options.length === 0) {
    return null;
  }

  return (
    <div className="bg-toolbar rounded-xl shadow-2xl border border-border/20 w-[250px] overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full h-12 px-4 flex items-center justify-between border-b border-border/30 hover:bg-secondary/30 transition-all bg-toolbar/50"
      >
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest flex items-center gap-2.5">
          <Palette className="w-4 h-4 text-accent" />
          {config.title}
        </h3>
        {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Options Container */}
      {!isCollapsed && (
        <div className="p-4 flex flex-col gap-4">
          {/* Brush Size Slider */}
          {config.options.includes('size') && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Size</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => onBrushSizeChange?.(parseInt(e.target.value))}
                className="w-full accent-accent h-2 cursor-pointer rounded-full"
                style={{
                  background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${(brushSize / 50) * 100}%, hsl(var(--secondary)) ${(brushSize / 50) * 100}%, hsl(var(--secondary)) 100%)`
                }}
                aria-label="Brush size"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground font-semibold">{brushSize}px</span>
                <div 
                  className="rounded-full bg-accent shadow-md shadow-accent/20" 
                  style={{ 
                    width: `${Math.max(10, Math.min(brushSize, 24))}px`, 
                    height: `${Math.max(10, Math.min(brushSize, 24))}px` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Opacity Slider */}
          {config.options.includes('opacity') && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Opacity</label>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange?.(parseInt(e.target.value))}
                className="w-full accent-accent h-2 cursor-pointer rounded-full"
                style={{
                  background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${opacity}%, hsl(var(--secondary)) ${opacity}%, hsl(var(--secondary)) 100%)`
                }}
                aria-label="Opacity"
              />
              <span className="text-xs text-foreground font-semibold block">{opacity}%</span>
            </div>
          )}

          {/* Color Picker */}
          {config.options.includes('color') && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => onColorChange?.(preset)}
                    className="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 shadow-md hover:shadow-lg relative group"
                    style={{ 
                      backgroundColor: preset, 
                      borderColor: color === preset ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                      boxShadow: color === preset ? '0 0 0 3px hsl(var(--accent) / 0.3)' : '0 2px 4px rgba(0,0,0,0.4)'
                    }}
                    title={preset}
                    aria-label={`Color: ${preset}`}
                  >
                    {color === preset && (
                      <div className="absolute inset-0 rounded-lg border-2 border-accent animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-border/30">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange?.(e.target.value)}
                  className="w-12 h-10 rounded-lg border-2 border-border/30 cursor-pointer hover:border-accent transition-colors"
                  aria-label="Custom color picker"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onColorChange?.(e.target.value)}
                  className="flex-1 px-3 py-2 bg-secondary/50 border border-border/30 rounded-lg text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
