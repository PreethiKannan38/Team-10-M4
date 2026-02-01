import { Tool } from './Tool'
import * as Y from 'yjs'

export class FillTool extends Tool {
  constructor(ctx, buffer, yStrokes) {
    super()
    this.ctx = ctx
    this.buffer = buffer
    this.bctx = buffer.getContext('2d')
    this.yStrokes = yStrokes
    this.color = '#000000'
    this.opacity = 1.0
  }

  setOptions(options) {
    if (options.color !== undefined) this.color = options.color;
    if (options.opacity !== undefined) this.opacity = options.opacity;
  }

  onPointerDown(e) {
    // Simple fill implementation - creates a filled rectangle at click position
    // For a real flood fill, you'd need to implement a flood fill algorithm
    const size = 100; // Size of the fill area
    const x = e.x - size / 2;
    const y = e.y - size / 2;

    const stroke = new Y.Map()
    stroke.set('id', crypto.randomUUID())
    stroke.set('type', 'fill')
    stroke.set('color', this.color)
    stroke.set('opacity', this.opacity)
    stroke.set('x', x)
    stroke.set('y', y)
    stroke.set('width', size)
    stroke.set('height', size)
    stroke.set('points', [
      { x, y },
      { x: x + size, y },
      { x: x + size, y: y + size },
      { x, y: y + size }
    ])

    this.yStrokes.push([stroke])
  }

  onPointerMove() {}
  onPointerUp() {}
  onCancel() {}
}
