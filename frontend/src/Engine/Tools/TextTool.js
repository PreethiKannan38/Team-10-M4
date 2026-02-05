/**
 * TextTool.js
 * 
 * High-Stability Version: Supports Drag-to-Create and accurate selection bounds.
 */

import BaseTool from './BaseTool';
import { AddObjectCommand, ModifyObjectCommand } from '../managers/HistoryManager';

export class TextTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isDragging = false;
    this.isEditing = false;
    this.editingObjectId = null;
    this.startPoint = null;
    this.endPoint = null;
    this.overlay = null;
    this.backdrop = null;
  }

  onPointerDown(event, engine) {
    if (event.button !== 0) return;
    
    // Commit existing before starting new
    if (this.isEditing) {
      this._commitText(engine);
    }

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

    this.isEditing = true;
    engine.state.isTyping = true;

    // Use absolute viewport coordinates for CSS
    const rect = engine.canvas.getBoundingClientRect();
    const x = Math.min(this.startPoint.x, this.endPoint.x) * engine.state.zoom + engine.state.pan.x + rect.left;
    const y = Math.min(this.startPoint.y, this.endPoint.y) * engine.state.zoom + engine.state.pan.y + rect.top;
    const w = Math.max(Math.abs(this.endPoint.x - this.startPoint.x) * engine.state.zoom, 250);
    const h = Math.max(Math.abs(this.endPoint.y - this.startPoint.y) * engine.state.zoom, 100);

    this._createInputOverlay(x, y, w, h, '', engine);
  }

  startEditingExisting(obj, screenX, screenY, engine) {
    this._removeOverlay(engine);
    this.isEditing = true;
    this.editingObjectId = obj.id;
    engine.state.isTyping = true;

    const rect = engine.canvas.getBoundingClientRect();
    const x = obj.geometry.x * engine.state.zoom + engine.state.pan.x + rect.left;
    const y = obj.geometry.y * engine.state.zoom + engine.state.pan.y + rect.top;
    const w = (obj.geometry.width || 200) * engine.state.zoom;
    const h = (obj.geometry.height || 100) * engine.state.zoom;

    this._createInputOverlay(x, y, w, h, obj.geometry.text, engine);
  }

  _createInputOverlay(x, y, w, h, initialText, engine) {
    const backdrop = document.createElement('div');
    Object.assign(backdrop.style, {
        position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.1)', zIndex: '2147483640'
    });
    document.body.appendChild(backdrop);
    this.backdrop = backdrop;

    const input = document.createElement('textarea');
    this.overlay = input;
    const brush = engine.state.brushOptions;
    
    Object.assign(input.style, {
      position: 'fixed', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`,
      background: 'white', color: '#000', border: '4px solid #6366F1', borderRadius: '12px',
      fontSize: '24px', padding: '16px', zIndex: '2147483647', resize: 'both', outline: 'none',
      fontFamily: brush.fontFamily || 'Inter, sans-serif',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    });

    input.value = initialText || '';
    input.placeholder = "Type Your Text Here...";
    document.body.appendChild(input);
    setTimeout(() => input.focus(), 20);

    const stop = (e) => e.stopPropagation();
    input.addEventListener('mousedown', stop);
    backdrop.addEventListener('mousedown', () => this._commitText(engine));

    input.onkeydown = (e) => {
      if (e.key === 'Escape') this._removeOverlay(engine);
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._commitText(engine); }
    };
  }

  _commitText(engine) {
    if (!this.overlay || !this.isEditing) return;
    const text = this.overlay.value.trim();
    
    if (text) {
      const brush = engine.state.brushOptions;
      const geometry = {
        x: this.editingObjectId ? engine.getObject(this.editingObjectId).geometry.x : Math.min(this.startPoint.x, this.endPoint.x),
        y: this.editingObjectId ? engine.getObject(this.editingObjectId).geometry.y : Math.min(this.startPoint.y, this.endPoint.y),
        width: this.overlay.offsetWidth / engine.state.zoom,
        height: this.overlay.offsetHeight / engine.state.zoom,
        text
      };

      if (this.editingObjectId) {
        engine.executeCommand(new ModifyObjectCommand(engine, this.editingObjectId, { geometry }));
      } else {
        engine.executeCommand(new AddObjectCommand(engine, {
          type: 'text',
          geometry,
          style: { color: brush.color, fontSize: 24, fontFamily: brush.fontFamily || 'Inter' }
        }));
      }
    }
    this._removeOverlay(engine);
  }

  _removeOverlay(engine) {
    if (this.overlay) this.overlay.remove();
    if (this.backdrop) this.backdrop.remove();
    this.overlay = null; this.backdrop = null; this.isEditing = false; this.editingObjectId = null;
    if (engine) engine.state.isTyping = false;
  }

  onDeactivate() { this._removeOverlay(); }

  renderPreview(ctx, engine) {
    if (!this.isDragging || !this.startPoint || !this.endPoint) return;
    ctx.save();
    ctx.strokeStyle = '#6366F1'; ctx.lineWidth = 3; ctx.setLineDash([8, 4]);
    const x = Math.min(this.startPoint.x, this.endPoint.x);
    const y = Math.min(this.startPoint.y, this.endPoint.y);
    const w = Math.abs(this.endPoint.x - this.startPoint.x);
    const h = Math.abs(this.endPoint.y - this.startPoint.y);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }
}

export default TextTool;
