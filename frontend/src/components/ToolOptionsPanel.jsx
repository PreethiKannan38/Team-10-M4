import React from 'react';

/**
 * ToolOptionsPanel - Contextual tool controls
 * Displays tool-specific options like brush size, opacity, smoothing
 * Appears below or beside the main toolbar
 */
export default function ToolOptionsPanel({ 
  activeTool = 'draw',
  brushSize = 5,
  opacity = 100,
  color = '#5B8EC6',
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
      options: ['size', 'hardness'],
    },
    shape: {
      title: 'Shapes Tool',
      options: ['size', 'fill', 'stroke', 'color'],
    },
    text: {
      title: 'Text Tool',
      options: ['fontSize', 'fontFamily', 'color'],
    },
    color: {
      title: 'Color Picker',
      options: [],
    },
  };

  const config = toolConfigs[activeTool] || toolConfigs.draw;

  const colorPresets = [
    '#000000',
    '#EF4444',
    '#3B82F6',
    '#22C55E',
    '#F59E0B',
  ];

  return (
    <div className="bg-[#384859] border-t border-[#465464] px-4 py-4 flex flex-col gap-4">
      {/* Tool Title */}
      <div>
        <h3 className="text-xs font-medium text-[#A8B5C3] uppercase tracking-widest">
          {config.title}
        </h3>
      </div>

      {/* Options Container */}
      <div className="flex flex-col gap-4">
        {/* Brush Size Slider */}
        {config.options.includes('size') && (
          <div>
            <label className="text-xs text-[#A8B5C3] mb-2 block">Size</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => onBrushSizeChange?.(parseInt(e.target.value))}
              className="w-full accent-[#5B8EC6]"
              aria-label="Brush size"
            />
            <span className="text-xs text-white mt-1 block">{brushSize}px</span>
          </div>
        )}

        {/* Opacity Slider */}
        {config.options.includes('opacity') && (
          <div>
            <label className="text-xs text-[#A8B5C3] mb-2 block">Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => onOpacityChange?.(parseInt(e.target.value))}
              className="w-full accent-[#5B8EC6]"
              aria-label="Opacity"
            />
            <span className="text-xs text-white mt-1 block">{opacity}%</span>
          </div>
        )}

        {/* Smoothing Slider */}
        {/* Color Picker */}
        {config.options.includes('color') && (
          <div>
            <label className="text-xs text-[#A8B5C3] mb-2 block">Color</label>
            <div className="flex gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onColorChange?.(preset)}
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: preset, borderColor: color === preset ? '#5B8EC6' : 'transparent' }}
                  title={preset}
                  aria-label={`Color: ${preset}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
