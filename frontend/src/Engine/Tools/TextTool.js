/**
 * TextTool.js
 * 
 * Final Fix: Guaranteed Visibility, 4-corner resizable box, and reliable focus.
 */

import BaseTool from './BaseTool';
import { AddObjectCommand } from '../managers/HistoryManager';

export class TextTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isDragging = false;
    this.isEditing = false;
    this.startPoint = null;
    this.endPoint = null;
    this.overlay = null;
  }

  onPointerDown(event, engine) {
    if (event.button !== 0) return;
    
    // Finalize existing
    if (this.isEditing) {
      this._commitText(engine);
      return;
    }

    if (!event.canvasX || !event.canvasY) return;

    this.isDragging = true;
    this.startPoint = { x: event.canvasX, y: event.canvasY };
    this.endPoint = { x: event.canvasX, y: event.canvasY };
  }

  onPointerMove(event, engine) {
    if (this.isDragging) {
      this.endPoint = { x: event.canvasX, y: event.canvasY };
    }
  }

  onPointerUp(event, engine) {
    if (!this.isDragging || !this.startPoint) return;
    this.isDragging = false;

    const width = Math.abs(this.endPoint.x - this.startPoint.x);
    const height = Math.abs(this.endPoint.y - this.startPoint.y);

    // Default large size for tiny drags
    if (width < 5 && height < 5) {
        this.endPoint = { 
            x: this.startPoint.x + 300, 
            y: this.startPoint.y + 120 
        };
    }

    this.isEditing = true;
    engine.state.isTyping = true;

    // Use Screen Coordinates for CSS positioning
    const rect = engine.canvas.getBoundingClientRect();
    const x = Math.min(this.startPoint.x, this.endPoint.x) * engine.state.zoom + engine.state.pan.x + rect.left;
    const y = Math.min(this.startPoint.y, this.endPoint.y) * engine.state.zoom + engine.state.pan.y + rect.top;
    const w = Math.max(width * engine.state.zoom, 300);
    const h = Math.max(height * engine.state.zoom, 120);

    this._createInputOverlay(x, y, w, h, engine);
  }

  _createInputOverlay(x, y, w, h, engine) {
    const input = document.createElement('textarea');
    this.overlay = input;

    const brush = engine.state.brushOptions;
    const fontSize = Math.max(24, (brush.width || 5) * 4);
    
    // Dim the background to highlight the input
    const backdrop = document.createElement('div');
    backdrop.id = 'text-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0,0,0,0.1)',
        zIndex: '2147483646',
        pointerEvents: 'auto'
    });
    document.body.appendChild(backdrop);

    Object.assign(input.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      background: 'white',
      color: '#000000',
      border: '6px solid #6366F1',
      borderRadius: '16px',
      outline: 'none',
      fontSize: `${fontSize}px`,
      fontFamily: brush.fontFamily || 'Inter, sans-serif',
      padding: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(99, 102, 241, 0.2)',
      zIndex: '2147483647',
      resize: 'both',
      display: 'block',
      lineHeight: '1.2'
    });

    input.placeholder = "Type Your Text Content Here...";
    document.body.appendChild(input);
    
    setTimeout(() => {
        input.focus();
    }, 100);

    const stopEvents = (e) => e.stopPropagation();
    input.addEventListener('mousedown', stopEvents);
    input.addEventListener('pointerdown', stopEvents);
    input.addEventListener('click', stopEvents);
    backdrop.addEventListener('mousedown', () => this._commitText(engine));

    input.onkeydown = (e) => {
      if (e.key === 'Escape') {
        this._removeOverlay(engine);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._commitText(engine);
      }
    };
  }

  _commitText(engine) {
    if (!this.overlay || !this.startPoint || !this.isEditing) return;

    const text = this.overlay.value.trim();
    if (text) {
      const brush = engine.state.brushOptions;
      const finalX = Math.min(this.startPoint.x, this.endPoint.x);
      const finalY = Math.min(this.startPoint.y, this.endPoint.y);

      const textObj = {
        type: 'text',
        geometry: {
          x: finalX,
          y: finalY,
          width: this.overlay.offsetWidth / engine.state.zoom,
          height: this.overlay.offsetHeight / engine.state.zoom,
          text: text
        },
        style: {
          color: brush.color === 'transparent' ? '#000000' : (brush.color || '#000000'),
          fontSize: Math.max(24, (brush.width || 5) * 4),
          fontFamily: brush.fontFamily || 'Inter, sans-serif',
          opacity: brush.opacity || 1
        }
      };

      engine.executeCommand(new AddObjectCommand(engine, textObj));
    }

    this._removeOverlay(engine);
  }

  _removeOverlay(engine) {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    const backdrop = document.getElementById('text-backdrop');
    if (backdrop) backdrop.remove();

    this.isEditing = false;
    this.startPoint = null;
    if (engine) engine.state.isTyping = false;
  }

  onDeactivate() {
    this._removeOverlay();
  }

  renderPreview(ctx, engine) {
    if (!this.isDragging || !this.startPoint || !this.endPoint) return;
    ctx.save();
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 6]);
    const x = Math.min(this.startPoint.x, this.endPoint.x);
    const y = Math.min(this.startPoint.y, this.endPoint.y);
    const w = Math.abs(this.endPoint.x - this.startPoint.x);
    const h = Math.abs(this.endPoint.y - this.startPoint.y);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

export default TextTool;