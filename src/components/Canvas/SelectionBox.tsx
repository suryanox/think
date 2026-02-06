import { Box } from '@mui/material'
import { useCanvasStore } from '../../stores'
import { getElementBounds, canvasToScreen } from '../../utils/geometry'
import type { HandlePosition } from '../../types'

interface SelectionBoxProps {
  onResizeStart?: (handle: HandlePosition, e: React.MouseEvent) => void
}

const HANDLE_SIZE = 8

const handles: { position: HandlePosition; cursor: string; style: object }[] = [
  { position: 'nw', cursor: 'nwse-resize', style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  { position: 'n', cursor: 'ns-resize', style: { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' } },
  { position: 'ne', cursor: 'nesw-resize', style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  { position: 'w', cursor: 'ew-resize', style: { top: '50%', left: -HANDLE_SIZE / 2, transform: 'translateY(-50%)' } },
  { position: 'e', cursor: 'ew-resize', style: { top: '50%', right: -HANDLE_SIZE / 2, transform: 'translateY(-50%)' } },
  { position: 'sw', cursor: 'nesw-resize', style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  { position: 's', cursor: 'ns-resize', style: { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' } },
  { position: 'se', cursor: 'nwse-resize', style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
]

const resizableTypes = ['image', 'text']

export function SelectionBox({ onResizeStart }: SelectionBoxProps) {
  const { elements, selectedIds, viewport } = useCanvasStore()

  if (selectedIds.length === 0) return null

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id))
  if (selectedElements.length === 0) return null

  const singleElement = selectedIds.length === 1 ? selectedElements[0] : null
  const isResizable = singleElement && resizableTypes.includes(singleElement.type)

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
    >
      {isResizable && handles.map((handle) => (
        <Box
          key={handle.position}
          onMouseDown={(e) => {
            e.stopPropagation()
            onResizeStart?.(handle.position, e)
          }}
          sx={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            backgroundColor: '#ffffff',
            border: '2px solid #6366f1',
            borderRadius: '2px',
            cursor: handle.cursor,
            pointerEvents: 'auto',
            zIndex: 10,
            ...handle.style,
          }}
        />
      ))}
    </Box>
  )
}
