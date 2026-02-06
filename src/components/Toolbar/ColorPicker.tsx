import { useState } from 'react'
import { Box, Popover, IconButton, Tooltip } from '@mui/material'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
}

const COLORS = [
  '#000000',
  '#ffffff',
  '#e03131',
  '#f08c00',
  '#fab005',
  '#2f9e44',
  '#1971c2',
  '#9c36b5',
  '#f783ac',
  '#868e96',
  '#495057',
  'transparent',
]

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const transparentPattern = 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'

  return (
    <>
      <Tooltip title={label} placement="right" arrow>
        <IconButton 
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            transition: 'all 0.15s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              bgcolor: color === 'transparent' ? 'transparent' : color || 'text.primary',
              border: '2px solid',
              borderColor: 'divider',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
              backgroundImage: color === 'transparent' ? transparentPattern : 'none',
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
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
          {COLORS.map((c) => (
            <IconButton
              key={c}
              onClick={() => {
                onChange(c)
                setAnchorEl(null)
              }}
              sx={{
                p: 0.5,
                borderRadius: 1,
                border: c === color ? '2px solid' : '2px solid transparent',
                borderColor: c === color ? 'primary.main' : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.75,
                  bgcolor: c === 'transparent' ? 'transparent' : c,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                  backgroundImage: c === 'transparent' ? transparentPattern : 'none',
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
