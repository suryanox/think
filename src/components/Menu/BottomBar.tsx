import { Paper } from '@mui/material'
import { ZoomControls } from './ZoomControls'

export function BottomBar() {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 0.5,
        borderRadius: 2,
        zIndex: 10,
      }}
    >
      <ZoomControls />
    </Paper>
  )
}
