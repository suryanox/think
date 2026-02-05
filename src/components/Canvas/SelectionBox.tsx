import { Box } from '@mui/material'
import { useCanvasStore } from '../../stores'
import { getElementBounds, canvasToScreen } from '../../utils/geometry'

export function SelectionBox() {
  const { elements, selectedIds, viewport } = useCanvasStore()

  if (selectedIds.length === 0) return null

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id))
  if (selectedElements.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const element of selectedElements) {
    const bounds = getElementBounds(element)
    minX = Math.min(minX, bounds.x)
    minY = Math.min(minY, bounds.y)
    maxX = Math.max(maxX, bounds.x + bounds.width)
    maxY = Math.max(maxY, bounds.y + bounds.height)
  }

  const topLeft = canvasToScreen(minX, minY, viewport)
  const bottomRight = canvasToScreen(maxX, maxY, viewport)

  const width = bottomRight.x - topLeft.x
  const height = bottomRight.y - topLeft.y

  return (
    <Box
      sx={{
        position: 'absolute',
        left: topLeft.x,
        top: topLeft.y,
        width,
        height,
        border: '2px solid #6366f1',
        borderRadius: 0.5,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    />
  )
}
