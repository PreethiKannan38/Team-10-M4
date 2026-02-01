import { Tool } from './Tool'

export class EyedropperTool extends Tool {
  constructor(ctx, buffer, onColorPick) {
    super()
    this.ctx = ctx
    this.buffer = buffer
    this.onColorPick = onColorPick
  }

  setOptions() {
    // Eyedropper doesn't need options
  }

  onPointerDown(e) {
    // Get the color at the clicked position
    const imageData = this.ctx.getImageData(e.x, e.y, 1, 1);
    const pixel = imageData.data;
    
    // Convert RGB to hex
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const hex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    // Call the callback with the picked color
    if (this.onColorPick) {
      this.onColorPick(hex);
    }
  }

  onPointerMove() {}
  onPointerUp() {}
  onCancel() {}
}
