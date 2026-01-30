export class StrokeNode {
  constructor(stroke) {
    this.id = stroke.get('id')
    this.points = stroke.get('points')
    this.color = stroke.get('color')
    this.width = stroke.get('width')
    this.bounds = computeBounds(this.points)
  }

  draw(ctx, selected = false) {
    if (this.points.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = selected ? 'rgba(0,120,255,0.8)' : this.color
    ctx.lineWidth = selected ? this.width + 2 : this.width
    ctx.moveTo(this.points[0].x, this.points[0].y)

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y)
    }
    ctx.stroke()
  }
}

function computeBounds(points) {
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}
