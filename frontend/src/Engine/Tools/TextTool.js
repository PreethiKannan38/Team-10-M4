/**
 * TextTool.js
 * 
 * Final Fix: Improved Text Tool with high visibility and reliable placement.
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
    if (event.button !== 0) return;
    if (!event.canvasX || !event.canvasY) return;

    if (this.isEditing) {
      this._commitText(engine);
      return;
    }

    this.textPosition = { x: event.canvasX, y: event.canvasY };
    this.isEditing = true;
    engine.state.isTyping = true;

    this._createInputOverlay(event.clientX, event.clientY, engine);
  }

  _createInputOverlay(screenX, screenY, engine) {
    const input = document.createElement('textarea');
    this.overlay = input;

    const brush = engine.state.brushOptions;
    // Set a much larger base font size for the input box
    const fontSize = Math.max(24, brush.width * 4);
    
    Object.assign(input.style, {
      position: 'fixed',
      left: `${screenX}px`,
      top: `${screenY}px`,
      background: 'white',
      border: '3px solid #8b5cf6',
      borderRadius: '12px',
      outline: 'none',
      color: brush.color === 'transparent' ? '#000000' : brush.color,
      fontSize: `${fontSize}px`,
      fontFamily: brush.fontFamily || 'Inter, sans-serif',
      padding: '16px',
      minWidth: '250px',
      minHeight: '80px',
      boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      zIndex: '10000',
      resize: 'both',
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.2'
    });

    input.placeholder = "Type text here...";
    document.body.appendChild(input);
    
    setTimeout(() => input.focus(), 50);

    const stopProp = (e) => e.stopPropagation();
    input.addEventListener('pointerdown', stopProp);
    input.addEventListener('mousedown', stopProp);
    input.addEventListener('click', stopProp);

    input.onkeydown = (e) => {
      if (e.key === 'Escape') {
        this._removeOverlay(engine);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._commitText(engine);
      }
    };

    // Commit when clicking away
    input.onblur = () => {
        setTimeout(() => {
            if (this.isEditing) this._commitText(engine);
        }, 150);
    };
  }

  _commitText(engine) {
    if (!this.overlay || !this.textPosition || !this.isEditing) return;

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
          fontSize: Math.max(24, brush.width * 4), // Matching input size
          fontFamily: brush.fontFamily || 'Inter, sans-serif',
          opacity: brush.opacity
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
    this.isEditing = false;
    if (engine) engine.state.isTyping = false;
  }

  onDeactivate() {
    this._removeOverlay();
  }

  renderPreview() {}
}

export default TextTool;
