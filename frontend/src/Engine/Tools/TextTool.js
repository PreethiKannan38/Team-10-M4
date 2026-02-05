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
    // Only handle left clicks
    if (event.button !== 0) return;

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
    const fontSize = Math.max(12, brush.width * 4);
    
    // Style the overlay to be extremely obvious
    Object.assign(input.style, {
      position: 'absolute',
      left: `${screenX}px`,
      top: `${screenY}px`,
      background: 'white',
      border: '2px solid #8b5cf6',
      borderRadius: '8px',
      outline: 'none',
      color: brush.color === 'transparent' ? '#000000' : brush.color,
      fontSize: `${fontSize}px`,
      fontFamily: brush.fontFamily || 'Inter, sans-serif',
      padding: '12px',
      minWidth: '200px',
      minHeight: '80px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
      zIndex: '2000',
      resize: 'both',
      overflow: 'hidden',
      whiteSpace: 'pre-wrap'
    });

    input.placeholder = "Type here...";
    document.body.appendChild(input);
    
    // Small delay to ensure focus works on all browsers
    setTimeout(() => input.focus(), 10);

    // Prevent clicks inside the box from triggering the canvas
    input.addEventListener('pointerdown', (e) => e.stopPropagation());
    input.addEventListener('mousedown', (e) => e.stopPropagation());

    // Finish on Blur or Escape
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
          color: brush.color === 'transparent' ? '#000000' : brush.color,
          fontSize: Math.max(12, brush.width * 4),
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
