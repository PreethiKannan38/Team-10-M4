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
    this.ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y)
    }
    this.ctx.stroke()
  }

  onPointerUp() {
    if (!this.drawing || this.points.length < 2) return
    this.drawing = false

    const stroke = new Y.Map()
    stroke.set('id', crypto.randomUUID())
    stroke.set('color', 'black')
    stroke.set('width', 2)
    stroke.set('points', this.points)

    this.yStrokes.push([stroke])
    this.points = []
  }

  onCancel() {
    this.drawing = false
    this.points = []
  }
}
