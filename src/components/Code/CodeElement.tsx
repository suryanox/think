import { useCallback } from 'react'
import { Box } from '@mui/material'
import { Code } from './Code'
import { useCanvasStore } from '../../stores'
import type { CanvasElement, Viewport } from '../../types'

interface CodeElementProps {
  element: CanvasElement
  viewport: Viewport
}

export function CodeElement({ element, viewport }: CodeElementProps) {
  const { updateElement, deleteElements } = useCanvasStore()

  const handleClose = useCallback(() => {
    deleteElements([element.id])
  }, [deleteElements, element.id])

  const handleCodeChange = useCallback(
    (code: string) => {
      updateElement(element.id, { code })
    },
    [updateElement, element.id]
  )

  const screenX = element.x * viewport.zoom + viewport.x
  const screenY = element.y * viewport.zoom + viewport.y

  return (
    <Box
      sx={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        transform: `scale(${viewport.zoom})`,
        transformOrigin: 'top left',
        zIndex: 100,
      }}
    >
      <Code
        initialCode={element.code || undefined}
        onClose={handleClose}
        onCodeChange={handleCodeChange}
      />
    </Box>
  )
}
