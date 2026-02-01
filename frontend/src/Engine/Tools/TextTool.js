import { Tool } from './Tool'
import * as Y from 'yjs'

export class TextTool extends Tool {
  constructor(ctx, buffer, yStrokes) {
    super()
    this.ctx = ctx
    this.buffer = buffer
    this.bctx = buffer.getContext('2d')
    this.yStrokes = yStrokes
    this.color = '#000000'
    this.opacity = 1.0
    this.textInput = null
  }

  setOptions(options) {
    if (options.color !== undefined) this.color = options.color;
    if (options.opacity !== undefined) this.opacity = options.opacity;
  }

  onPointerDown(e) {
    // Note: Using prompt() for simplicity. In a production app, this should be
    // replaced with a proper accessible text input UI component with keyboard
    // navigation and screen reader support.
    const text = prompt('Enter text:');
    if (!text) return;

    const stroke = new Y.Map()
    stroke.set('id', crypto.randomUUID())
    stroke.set('type', 'text')
    stroke.set('color', this.color)
    stroke.set('opacity', this.opacity)
    stroke.set('text', text)
    stroke.set('x', e.x)
    stroke.set('y', e.y)
    stroke.set('fontSize', 24)
    stroke.set('points', [{ x: e.x, y: e.y }])

    this.yStrokes.push([stroke])
  }

  onPointerMove() {}
  onPointerUp() {}
  onCancel() {}
}
