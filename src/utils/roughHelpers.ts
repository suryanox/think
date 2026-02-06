import rough from 'roughjs'
import type { CanvasElement } from '../types'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { getThemeAwareColor } from '../theme'

const imageCache = new Map<string, HTMLImageElement>()

export function createRoughCanvas(canvas: HTMLCanvasElement): RoughCanvas {
  return rough.canvas(canvas)
}

function getImage(src: string, onLoad: () => void): HTMLImageElement | null {
  const cached = imageCache.get(src)
  if (cached && cached.complete) {
    return cached
  }
  
  if (!cached) {
    const img = new window.Image()
    img.onload = onLoad
    img.src = src
    imageCache.set(src, img)
  }
  
  return null
}

export function drawElement(
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  element: CanvasElement,
  isDark: boolean = true,
  onImageLoad?: () => void
) {
  ctx.save()
  ctx.globalAlpha = element.opacity

  const strokeColor = getThemeAwareColor(element.strokeColor, isDark)
  const fillColor = getThemeAwareColor(element.fillColor, isDark)

  const options = {
    stroke: strokeColor,
    fill: fillColor === 'transparent' ? undefined : fillColor,
    strokeWidth: element.strokeWidth,
    roughness: element.roughness ?? 1,
    seed: element.seed ?? 1,
  }

  switch (element.type) {
    case 'rectangle':
      rc.rectangle(element.x, element.y, element.width, element.height, options)
      break

    case 'ellipse':
      rc.ellipse(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width,
        element.height,
        options
      )
      break

    case 'line':
      if (element.points && element.points.length >= 2) {
        const [start, end] = element.points
        rc.line(
          element.x + start.x,
          element.y + start.y,
          element.x + end.x,
          element.y + end.y,
          options
        )
      }
      break

    case 'arrow':
      if (element.points && element.points.length >= 2) {
        const [start, end] = element.points
        const startX = element.x + start.x
        const startY = element.y + start.y
        const endX = element.x + end.x
        const endY = element.y + end.y

        rc.line(startX, startY, endX, endY, options)

        const angle = Math.atan2(endY - startY, endX - startX)
        const arrowLength = 15
        const arrowAngle = Math.PI / 6

        const arrow1X = endX - arrowLength * Math.cos(angle - arrowAngle)
        const arrow1Y = endY - arrowLength * Math.sin(angle - arrowAngle)
        const arrow2X = endX - arrowLength * Math.cos(angle + arrowAngle)
        const arrow2Y = endY - arrowLength * Math.sin(angle + arrowAngle)

        rc.line(endX, endY, arrow1X, arrow1Y, options)
        rc.line(endX, endY, arrow2X, arrow2Y, options)
      }
      break

    case 'pen':
      if (element.points && element.points.length > 1) {
        drawFreehandPath(ctx, element, strokeColor)
      }
      break

    case 'disappearing-pen':
      if (element.points && element.points.length > 1) {
        drawSparklingPath(ctx, element)
      }
      break

    case 'text':
      {
        const fontSize = element.height > 0 ? element.height * 0.8 : element.strokeWidth * 8
        ctx.font = `${fontSize}px "Virgil", "Segoe Print", "Comic Sans MS", cursive`
        ctx.fillStyle = strokeColor
        ctx.fillText(element.text || '', element.x, element.y)
      }
      break

    case 'image':
      if (element.imageData) {
        const img = getImage(element.imageData, onImageLoad || (() => {}))
        if (img) {
          ctx.drawImage(img, element.x, element.y, element.width, element.height)
        }
      }
      break
  }

  ctx.restore()
}

function drawFreehandPath(ctx: CanvasRenderingContext2D, element: CanvasElement, strokeColor: string) {
  if (!element.points || element.points.length < 2) return

  ctx.beginPath()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = element.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const points = element.points.map((p) => ({
    x: element.x + p.x,
    y: element.y + p.y,
  }))

  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2
    const midY = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY)
  }

  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

function drawSparklingPath(ctx: CanvasRenderingContext2D, element: CanvasElement) {
  if (!element.points || element.points.length < 2) return

  const points = element.points.map((p) => ({
    x: element.x + p.x,
    y: element.y + p.y,
  }))

  ctx.save()

  ctx.shadowColor = element.strokeColor
  ctx.shadowBlur = 12
  ctx.strokeStyle = element.strokeColor
  ctx.lineWidth = element.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2
    const midY = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY)
  }

  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = element.strokeWidth * 0.4
  ctx.stroke()

  ctx.restore()
}
