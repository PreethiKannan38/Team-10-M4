import { Tool } from './Tool'
import * as Y from 'yjs'

// Default fill size constant
const DEFAULT_FILL_SIZE = 100;

export class FillTool extends Tool {
  constructor(ctx, buffer, yStrokes) {
    super()
    this.ctx = ctx
    this.buffer = buffer
    this.bctx = buffer.getContext('2d')
    this.yStrokes = yStrokes
    this.color = '#000000'
    this.opacity = 1.0
    this.fillSize = DEFAULT_FILL_SIZE
  }

  setOptions(options) {
    if (options.color !== undefined) this.color = options.color;
    if (options.opacity !== undefined) this.opacity = options.opacity;
  }

  onPointerDown(e) {
    // Simple fill implementation - creates a filled rectangle at click position
    // For a real flood fill, you'd need to implement a flood fill algorithm
    const x = e.x - this.fillSize / 2;
    const y = e.y - this.fillSize / 2;

    const stroke = new Y.Map()
    stroke.set('id', crypto.randomUUID())
    stroke.set('type', 'fill')
    stroke.set('color', this.color)
    stroke.set('opacity', this.opacity)
    stroke.set('x', x)
    stroke.set('y', y)
    stroke.set('width', this.fillSize)
    stroke.set('height', this.fillSize)
    stroke.set('points', [
      { x, y },
      { x: x + this.fillSize, y },
      { x: x + this.fillSize, y: y + this.fillSize },
      { x, y: y + this.fillSize }
    ])

    this.yStrokes.push([stroke])
  }

  onPointerMove() {}
  onPointerUp() {}
  onCancel() {}
}
