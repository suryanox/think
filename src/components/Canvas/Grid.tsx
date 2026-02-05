import { Box } from '@mui/material'
import { useThemeStore } from '../../stores'
import { getGridColor } from '../../theme'

interface GridProps {
  viewport: { x: number; y: number; zoom: number }
}

const GRID_SIZE = 20

export function Grid({ viewport }: GridProps) {
  const { isDark } = useThemeStore()
  const gridColor = getGridColor(isDark)
  const scaledGrid = GRID_SIZE * viewport.zoom

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: `${scaledGrid}px ${scaledGrid}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        pointerEvents: 'none',
      }}
    />
  )
}
