export class StrokeNode {
  constructor(stroke) {
    this.id = stroke.get('id')
    this.type = stroke.get('type') || 'stroke'
    this.points = stroke.get('points')
    this.color = stroke.get('color') || '#000000'
    this.width = stroke.get('width') || 2
    this.opacity = stroke.get('opacity') || 1.0
    
    // For text type
    this.text = stroke.get('text')
    this.fontSize = stroke.get('fontSize') || 24
    this.x = stroke.get('x')
    this.y = stroke.get('y')
    
    // For fill type
    this.fillWidth = stroke.get('width')
    this.fillHeight = stroke.get('height')
    
    this.bounds = computeBounds(this.points)
  }

  draw(ctx, selected = false) {
    ctx.save()
    
    if (this.type === 'text' && this.text) {
      // Draw text
      ctx.font = `${this.fontSize}px Inter, sans-serif`
      ctx.fillStyle = selected ? 'rgba(0,120,255,0.8)' : this.color
      ctx.globalAlpha = selected ? 1.0 : this.opacity
      ctx.fillText(this.text, this.x, this.y)
    } else if (this.type === 'fill') {
      // Draw filled rectangle
      ctx.fillStyle = selected ? 'rgba(0,120,255,0.8)' : this.color
      ctx.globalAlpha = selected ? 1.0 : this.opacity
      ctx.fillRect(this.x, this.y, this.fillWidth, this.fillHeight)
    } else {
      // Draw regular stroke
      if (this.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = selected ? 'rgba(0,120,255,0.8)' : this.color
      ctx.lineWidth = selected ? this.width + 2 : this.width
      ctx.globalAlpha = selected ? 1.0 : this.opacity
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(this.points[0].x, this.points[0].y)

      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y)
      }
      ctx.stroke()
    }
    
    ctx.restore()
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
