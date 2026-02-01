import { Tool } from './Tool'
import * as Y from 'yjs'

export class DrawTool extends Tool {
  constructor(ctx, buffer, yStrokes) {
    super()
    this.ctx = ctx
    this.buffer = buffer
    this.bctx = buffer.getContext('2d')
    this.yStrokes = yStrokes
    this.drawing = false
    this.points = []
    this.color = '#000000'
    this.width = 5
    this.opacity = 1.0
  }

  setOptions(options) {
    if (options.color !== undefined) this.color = options.color;
    if (options.width !== undefined) this.width = options.width;
    if (options.opacity !== undefined) this.opacity = options.opacity;
  }

  onPointerDown(e) {
    this.drawing = true
    this.points = [{ x: e.x, y: e.y }]
  }

  onPointerMove(e) {
    if (!this.drawing) return

    this.points.push({ x: e.x, y: e.y })

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.drawImage(this.buffer, 0, 0)

    this.ctx.beginPath()
    this.ctx.strokeStyle = this.color
    this.ctx.lineWidth = this.width
    this.ctx.globalAlpha = this.opacity
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y)
    }
    this.ctx.stroke()
    this.ctx.globalAlpha = 1.0
  }

  onPointerUp() {
    if (!this.drawing || this.points.length < 2) return
    this.drawing = false

    const stroke = new Y.Map()
    stroke.set('id', crypto.randomUUID())
    stroke.set('color', this.color)
    stroke.set('width', this.width)
    stroke.set('opacity', this.opacity)
    stroke.set('points', this.points)

    this.yStrokes.push([stroke])
    this.points = []
  }

  onCancel() {
    this.drawing = false
    this.points = []
  }
}
