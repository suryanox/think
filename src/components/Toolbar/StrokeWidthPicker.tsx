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
      <Tooltip title="Stroke width">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <LineWeight />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 150 }}>
          <Typography variant="caption" gutterBottom>
            Stroke width: {value}px
          </Typography>
          <Slider
            value={value}
            onChange={(_, v) => onChange(v as number)}
            min={1}
            max={20}
            step={1}
            size="small"
          />
        </Box>
      </Popover>
    </>
  )
}
