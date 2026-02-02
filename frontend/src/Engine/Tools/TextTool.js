/**
 * TextTool.js
 * 
 * Text creation and editing tool.
 * Click to create text, type to edit, click elsewhere to finish.
 */

import BaseTool from './BaseTool';
import { AddObjectCommand } from '../managers/HistoryManager';

export class TextTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isEditing = false;
    this.textPosition = null;
    this.currentText = '';
    this.fontSize = 16;
    this.fontFamily = 'Arial';
  }

  /**
   * Start text editing on pointer down
   */
  onPointerDown(event, engine) {
    if (!event.canvasX || !event.canvasY) return;

    // If already editing, finalize current text
    if (this.isEditing) {
      this._commitText(engine);
    }

    // Start new text at click position
    this.textPosition = { x: event.canvasX, y: event.canvasY };
    this.currentText = '';
    this.isEditing = true;

    // In real implementation, would attach a text input overlay here
    // For now, simulate text input via console
    console.log('Text tool: Click to place text, then type. Press Enter to confirm.');
  }

  /**
   * Not used for text tool (input comes from keyboard)
   */
  onPointerMove(event, engine) {
    // Text tool doesn't respond to drag
  }

  /**
   * Handle keyboard input for text
   * @param {KeyboardEvent} event
   */
  onKeyDown(event, engine) {
    if (!this.isEditing || !this.textPosition) return;

    if (event.key === 'Enter') {
      this._commitText(engine);
    } else if (event.key === 'Backspace') {
      this.currentText = this.currentText.slice(0, -1);
    } else if (event.key.length === 1) {
      this.currentText += event.key;
    }
  }

  /**
   * Finalize and commit text to scene
   * @private
   */
  _commitText(engine) {
    if (!this.textPosition || !this.currentText) {
      this.isEditing = false;
      this.textPosition = null;
      this.currentText = '';
      return;
    }

    // Create text object
    const textObj = {
      type: 'text',
      geometry: {
        x: this.textPosition.x,
        y: this.textPosition.y,
        text: this.currentText
      },
      style: {
        color: engine.state.brushOptions.color || '#000000',
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        opacity: engine.state.brushOptions.opacity || 1
      },
      layerId: engine.state.activeLayerId
    };

    // Commit to scene
    const command = new AddObjectCommand(
      engine,
      textObj
    );
    engine.executeCommand(command);

    // Clear editing state
    this.isEditing = false;
    this.textPosition = null;
    this.currentText = '';
  }

  /**
   * Not used for text tool
   */
  onPointerUp(event, engine) {
    // Text editing continues until Enter is pressed
  }

  /**
   * Preview text being typed
   */
  renderPreview(ctx, engine) {
    if (!this.isEditing || !this.textPosition || !this.currentText) return;

    ctx.fillStyle = engine.state.brushOptions.color || '#000000';
    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    ctx.fillText(
      this.currentText,
      this.textPosition.x,
      this.textPosition.y
    );

    // Draw cursor (blinking line)
    const metrics = ctx.measureText(this.currentText);
    const cursorX = this.textPosition.x + metrics.width;
    ctx.strokeStyle = engine.state.brushOptions.color || '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cursorX, this.textPosition.y - this.fontSize);
    ctx.lineTo(cursorX, this.textPosition.y + 2);
    ctx.stroke();
  }
}

export default TextTool;
