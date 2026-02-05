import { useRef, useCallback, useEffect } from 'react'
import { useCanvasStore, useThemeStore } from '../stores'
import { createRoughCanvas, drawElement } from '../utils/roughHelpers'
import { getCanvasBackground, getGridColor } from '../theme'

const GRID_SIZE = 20

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { elements, viewport, currentElement } = useCanvasStore()
  const { isDark } = useThemeStore()

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gridColor = getGridColor(isDark)
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      const offsetX = viewport.x % (GRID_SIZE * viewport.zoom)
      const offsetY = viewport.y % (GRID_SIZE * viewport.zoom)
      const scaledGrid = GRID_SIZE * viewport.zoom

      for (let x = offsetX; x < width; x += scaledGrid) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = offsetY; y < height; y += scaledGrid) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    },
    [viewport, isDark]
  )

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.fillStyle = getCanvasBackground(isDark)
    ctx.fillRect(0, 0, width, height)

    drawGrid(ctx, width, height)

    ctx.save()
    ctx.translate(viewport.x, viewport.y)
    ctx.scale(viewport.zoom, viewport.zoom)

    const rc = createRoughCanvas(canvas)

    for (const element of elements) {
      drawElement(rc, ctx, element)
    }

    if (currentElement) {
      drawElement(rc, ctx, currentElement)
    }

    ctx.restore()
  }, [elements, viewport, currentElement, isDark, drawGrid])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => render()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  return { canvasRef, render }
}
