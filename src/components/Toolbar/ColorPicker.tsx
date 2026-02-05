import { useState } from 'react'
import { Box, Popover, IconButton, Tooltip } from '@mui/material'
import { Palette } from '@mui/icons-material'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
}

const COLORS = [
  '#1e1e1e',
  '#e03131',
  '#2f9e44',
  '#1971c2',
  '#f08c00',
  '#9c36b5',
  '#0c8599',
  '#f783ac',
  '#868e96',
  '#ffffff',
  'transparent',
]

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  return (
    <>
      <Tooltip title={label}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              bgcolor: color === 'transparent' ? 'transparent' : color,
              border: '2px solid',
              borderColor: 'divider',
              backgroundImage:
                color === 'transparent'
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : 'none',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
          {COLORS.map((c) => (
            <IconButton
              key={c}
              onClick={() => {
                onChange(c)
                setAnchorEl(null)
              }}
              sx={{
                p: 0.5,
                border: c === color ? '2px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.5,
                  bgcolor: c === 'transparent' ? 'transparent' : c,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundImage:
                    c === 'transparent'
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                      : 'none',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }}
              />
            </IconButton>
          ))}
        </Box>
      </Popover>
    </>
  )
}
