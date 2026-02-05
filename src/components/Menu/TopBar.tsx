import { Box, Paper } from '@mui/material'
import { FileMenu } from './FileMenu'
import { UndoRedo } from './UndoRedo'
import { ThemeToggle } from '../common/ThemeToggle'

export function TopBar() {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        zIndex: 10,
      }}
    >
      <FileMenu />
      <UndoRedo />
      <ThemeToggle />
    </Paper>
  )
}
