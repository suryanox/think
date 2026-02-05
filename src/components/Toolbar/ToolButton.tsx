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
    <Tooltip title={`${label}${shortcut ? ` (${shortcut})` : ''}`} placement="right">
      <IconButton
        onClick={() => setTool(tool)}
        sx={{
          bgcolor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.hover',
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  )
}
