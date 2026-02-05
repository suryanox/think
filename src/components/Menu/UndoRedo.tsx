import { IconButton, Tooltip } from '@mui/material'
import { Undo, Redo } from '@mui/icons-material'
import { useHistoryStore } from '../../stores'

export function UndoRedo() {
  const { undo, redo, canUndo, canRedo } = useHistoryStore()

  return (
    <>
      <Tooltip title="Undo (Ctrl+Z)">
        <span>
          <IconButton onClick={undo} disabled={!canUndo()} size="small">
            <Undo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)">
        <span>
          <IconButton onClick={redo} disabled={!canRedo()} size="small">
            <Redo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </>
  )
}
