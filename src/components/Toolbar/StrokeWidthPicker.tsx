import { useState } from 'react'
import { Box, Popover, IconButton, Tooltip, Slider, Typography } from '@mui/material'
import { LineWeight } from '@mui/icons-material'

interface StrokeWidthPickerProps {
  value: number
  onChange: (width: number) => void
}

export function StrokeWidthPicker({ value, onChange }: StrokeWidthPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  return (
    <>
      <Tooltip title="Stroke width" placement="right" arrow>
        <IconButton 
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            color: 'text.secondary',
            transition: 'all 0.15s ease',
            '&:hover': {
              color: 'text.primary',
              transform: 'scale(1.05)',
            },
          }}
        >
          <LineWeight fontSize="small" />
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
        <Box sx={{ p: 2, width: 160 }}>
          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Stroke: {value}px
          </Typography>
          <Slider
            value={value}
            onChange={(_, v) => onChange(v as number)}
            min={1}
            max={20}
            step={1}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
      </Popover>
    </>
  )
}
