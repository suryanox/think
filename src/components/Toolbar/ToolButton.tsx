import type { ReactNode } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useToolStore } from '../../stores'
import type { ToolType } from '../../types'

interface ToolButtonProps {
  tool: ToolType
  icon: ReactNode
  label: string
  shortcut?: string
}

export function ToolButton({ tool, icon, label, shortcut }: ToolButtonProps) {
  const { activeTool, setTool } = useToolStore()
  const isActive = activeTool === tool

  return (
    <Tooltip title={`${label}${shortcut ? ` (${shortcut})` : ''}`} placement="right" arrow>
      <IconButton
        onClick={() => setTool(tool)}
        size="small"
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.secondary',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.selected',
            color: isActive ? 'primary.contrastText' : 'text.primary',
            transform: 'scale(1.05)',
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  )
}
