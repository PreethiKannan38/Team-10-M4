export function drawSelectionBox(ctx, box) {
  if (!box) return

  ctx.save()
  ctx.strokeStyle = 'rgba(0,120,255,0.8)'
  ctx.fillStyle = 'rgba(0,120,255,0.15)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 4])

  ctx.strokeRect(box.x, box.y, box.w, box.h)
  ctx.fillRect(box.x, box.y, box.w, box.h)

  ctx.restore()
}
