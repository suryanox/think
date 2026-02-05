import type { CanvasElement } from '../types'
import { getElementBounds } from './geometry'

export function exportToJSON(elements: CanvasElement[]): string {
  return JSON.stringify({ version: 1, elements }, null, 2)
}

export function downloadJSON(elements: CanvasElement[], filename = 'think-drawing.json') {
  const json = exportToJSON(elements)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function importFromJSON(json: string): CanvasElement[] {
  try {
    const data = JSON.parse(json)
    if (data.elements && Array.isArray(data.elements)) {
      return data.elements
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e)
  }
  return []
}

export async function exportToPNG(
  canvas: HTMLCanvasElement,
  elements: CanvasElement[],
  filename = 'think-drawing.png'
) {
  const bounds = getCanvasBounds(elements)
  if (!bounds) return

  const exportCanvas = document.createElement('canvas')
  const padding = 20
  exportCanvas.width = bounds.width + padding * 2
  exportCanvas.height = bounds.height + padding * 2

  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

  ctx.drawImage(
    canvas,
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2,
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  )

  const blob = await new Promise<Blob | null>((resolve) =>
    exportCanvas.toBlob(resolve, 'image/png')
  )
  if (blob) {
    downloadBlob(blob, filename)
  }
}

export async function exportToSVG(elements: CanvasElement[], filename = 'think-drawing.svg') {
  const bounds = getCanvasBounds(elements)
  if (!bounds) return

  const padding = 20
  const width = bounds.width + padding * 2
  const height = bounds.height + padding * 2

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`
  svg += `<rect width="100%" height="100%" fill="white"/>\n`

  for (const element of elements) {
    const offsetX = -bounds.x + padding
    const offsetY = -bounds.y + padding

    switch (element.type) {
      case 'rectangle':
        svg += `<rect x="${element.x + offsetX}" y="${element.y + offsetY}" width="${element.width}" height="${element.height}" stroke="${element.strokeColor}" fill="${element.fillColor === 'transparent' ? 'none' : element.fillColor}" stroke-width="${element.strokeWidth}" opacity="${element.opacity}"/>\n`
        break
      case 'ellipse':
        svg += `<ellipse cx="${element.x + element.width / 2 + offsetX}" cy="${element.y + element.height / 2 + offsetY}" rx="${element.width / 2}" ry="${element.height / 2}" stroke="${element.strokeColor}" fill="${element.fillColor === 'transparent' ? 'none' : element.fillColor}" stroke-width="${element.strokeWidth}" opacity="${element.opacity}"/>\n`
        break
      case 'line':
        if (element.points && element.points.length >= 2) {
          const [start, end] = element.points
          svg += `<line x1="${element.x + start.x + offsetX}" y1="${element.y + start.y + offsetY}" x2="${element.x + end.x + offsetX}" y2="${element.y + end.y + offsetY}" stroke="${element.strokeColor}" stroke-width="${element.strokeWidth}" opacity="${element.opacity}"/>\n`
        }
        break
      case 'pen':
      case 'disappearing-pen':
        if (element.points && element.points.length > 1) {
          const pathData = element.points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${element.x + p.x + offsetX} ${element.y + p.y + offsetY}`)
            .join(' ')
          svg += `<path d="${pathData}" stroke="${element.strokeColor}" fill="none" stroke-width="${element.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${element.opacity}"/>\n`
        }
        break
      case 'text':
        svg += `<text x="${element.x + offsetX}" y="${element.y + offsetY}" fill="${element.strokeColor}" font-size="${element.strokeWidth * 8}" opacity="${element.opacity}">${element.text || ''}</text>\n`
        break
    }
  }

  svg += '</svg>'

  const blob = new Blob([svg], { type: 'image/svg+xml' })
  downloadBlob(blob, filename)
}

function getCanvasBounds(elements: CanvasElement[]) {
  if (elements.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const element of elements) {
    const bounds = getElementBounds(element)
    minX = Math.min(minX, bounds.x)
    minY = Math.min(minY, bounds.y)
    maxX = Math.max(maxX, bounds.x + bounds.width)
    maxY = Math.max(maxY, bounds.y + bounds.height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
