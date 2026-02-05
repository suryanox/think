import { Box, IconButton, Typography, Tooltip } from '@mui/material'
import { Add, Remove, CenterFocusStrong } from '@mui/icons-material'
import { useZoom } from '../../hooks'
import { useCanvasStore } from '../../stores'

export function ZoomControls() {
  const { zoomIn, zoomOut, resetZoom } = useZoom()
  const { viewport } = useCanvasStore()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title="Zoom out">
        <IconButton onClick={zoomOut} size="small">
          <Remove fontSize="small" />
        </IconButton>
      </Tooltip>
      <Typography variant="body2" sx={{ minWidth: 48, textAlign: 'center' }}>
        {Math.round(viewport.zoom * 100)}%
      </Typography>
      <Tooltip title="Zoom in">
        <IconButton onClick={zoomIn} size="small">
          <Add fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset zoom">
        <IconButton onClick={resetZoom} size="small">
          <CenterFocusStrong fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
