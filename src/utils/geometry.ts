import type { CanvasElement, Point, SelectionBounds, Viewport } from '../types'

export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: Viewport
): Point {
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  }
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: Viewport
): Point {
  return {
    x: canvasX * viewport.zoom + viewport.x,
    y: canvasY * viewport.zoom + viewport.y,
  }
}

export function getElementBounds(element: CanvasElement): SelectionBounds {
  if (element.points && element.points.length > 0) {
    const xs = element.points.map((p) => p.x)
    const ys = element.points.map((p) => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    return {
      x: element.x + minX,
      y: element.y + minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  }
}

export function isPointInElement(
  point: Point,
  element: CanvasElement,
  threshold = 5
): boolean {
  const bounds = getElementBounds(element)
  const padding = threshold

  return (
    point.x >= bounds.x - padding &&
    point.x <= bounds.x + bounds.width + padding &&
    point.y >= bounds.y - padding &&
    point.y <= bounds.y + bounds.height + padding
  )
}

export function isPointInBounds(point: Point, bounds: SelectionBounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

export function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  }
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}
