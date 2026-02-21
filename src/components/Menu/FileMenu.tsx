import { useState, useRef } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip, Divider } from '@mui/material'
import { Menu as MenuIcon, FileOpen, Delete, Code } from '@mui/icons-material'
import { useCanvasStore, useHistoryStore } from '../../stores'
import { downloadJSON, importFromJSON } from '../../utils/export'
import { clearLocalStorage } from '../../utils/storage'

export function FileMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { elements, setElements, clearCanvas } = useCanvasStore()
  const { clear: clearHistory } = useHistoryStore()

  const handleExportJSON = () => {
    downloadJSON(elements)
    setAnchorEl(null)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const json = event.target?.result as string
      const imported = importFromJSON(json)
      if (imported.length > 0) {
        setElements(imported)
        clearHistory()
      }
    }
    reader.readAsText(file)
    setAnchorEl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    clearCanvas()
    clearLocalStorage()
    clearHistory()
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Menu">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem onClick={handleImport}>
          <ListItemIcon>
            <FileOpen fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import JSON</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon>
            <Code fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClear}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear canvas</ListItemText>
        </MenuItem>
      </Menu>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  )
}
