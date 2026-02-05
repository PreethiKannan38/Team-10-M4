/**
 * TextTool.js
 * 
 * Improved Text Tool with dynamic HTML input overlay for a better "text box" experience.
 */

import BaseTool from './BaseTool';
import { AddObjectCommand } from '../managers/HistoryManager';

export class TextTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isEditing = false;
    this.overlay = null;
    this.textPosition = null;
  }

  onPointerDown(event, engine) {
    if (!event.canvasX || !event.canvasY) return;

    // Finalize any existing edit
    if (this.isEditing) {
      this._commitText(engine);
      return;
    }

    this.textPosition = { x: event.canvasX, y: event.canvasY };
    this.isEditing = true;
    engine.state.isTyping = true; // Prevent delete key from removing objects while typing

    this._createInputOverlay(event.clientX, event.clientY, engine);
  }

  _createInputOverlay(screenX, screenY, engine) {
    const input = document.createElement('textarea');
    this.overlay = input;

    const brush = engine.state.brushOptions;
    
    // Style the overlay to match current properties
    Object.assign(input.style, {
      position: 'absolute',
      left: `${screenX}px`,
      top: `${screenY}px`,
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #8b5cf6',
      borderRadius: '8px',
      outline: 'none',
      color: brush.color,
      fontSize: `${brush.width * 4}px`, // Using brush width as a proxy for font size
      fontFamily: brush.fontFamily || 'Inter, sans-serif',
      padding: '12px',
      minWidth: '200px',
      minHeight: '100px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      zIndex: '1000',
      resize: 'both',
      overflow: 'hidden',
      whiteSpace: 'pre-wrap'
    });

    document.body.appendChild(input);
    input.focus();

    // Finish on Blur or Escape
    input.onblur = () => this._commitText(engine);
    input.onkeydown = (e) => {
      if (e.key === 'Escape') {
        this._removeOverlay();
        engine.state.isTyping = false;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._commitText(engine);
      }
    };
  }

  _commitText(engine) {
    if (!this.overlay || !this.textPosition) {
      this._removeOverlay();
      engine.state.isTyping = false;
      return;
    }

    const text = this.overlay.value.trim();
    if (text) {
      const brush = engine.state.brushOptions;
      const textObj = {
        type: 'text',
        geometry: {
          x: this.textPosition.x,
          y: this.textPosition.y,
          text: text
        },
        style: {
          color: brush.color,
          fontSize: brush.width * 4,
          fontFamily: brush.fontFamily || 'Inter, sans-serif',
          opacity: brush.opacity
        }
      };

      engine.executeCommand(new AddObjectCommand(engine, textObj));
    }

    this._removeOverlay();
    engine.state.isTyping = false;
  }

  _removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.isEditing = false;
  }

  onDeactivate() {
    this._removeOverlay();
  }

  renderPreview(ctx, engine) {
    // Preview is handled by the HTML overlay
  }
}

export default TextTool;