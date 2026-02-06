import { Box, Paper } from '@mui/material'
import {
  NearMe,
  CropSquare,
  RadioButtonUnchecked,
  Remove,
  TrendingFlat,
  Create,
  TextFields,
  AutoFixHigh,
  PanTool,
} from '@mui/icons-material'
import { ToolButton } from './ToolButton'
import { ColorPicker } from './ColorPicker'
import { StrokeWidthPicker } from './StrokeWidthPicker'
import { useToolStore } from '../../stores'

function ToolGroup({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        p: 0.5,
        borderRadius: 1.5,
        bgcolor: 'action.hover',
      }}
    >
      {children}
    </Box>
  )
}

export function Toolbar() {
  const { strokeColor, fillColor, strokeWidth, setStrokeColor, setFillColor, setStrokeWidth } =
    useToolStore()

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1,
        borderRadius: 3,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        bgcolor: 'rgba(var(--Paper-overlayColor), 0.9)',
      }}
    >
      <ToolGroup>
        <ToolButton tool="select" icon={<NearMe />} label="Select" shortcut="V" />
        <ToolButton tool="pan" icon={<PanTool />} label="Pan" shortcut="H" />
      </ToolGroup>

      <ToolGroup>
        <ToolButton tool="rectangle" icon={<CropSquare />} label="Rectangle" shortcut="R" />
        <ToolButton tool="ellipse" icon={<RadioButtonUnchecked />} label="Ellipse" shortcut="O" />
        <ToolButton tool="line" icon={<Remove />} label="Line" shortcut="L" />
        <ToolButton tool="arrow" icon={<TrendingFlat />} label="Arrow" shortcut="A" />
      </ToolGroup>

      <ToolGroup>
        <ToolButton tool="pen" icon={<Create />} label="Pen" shortcut="P" />
        <ToolButton tool="disappearing-pen" icon={<AutoFixHigh />} label="Disappearing Pen" shortcut="D" />
        <ToolButton tool="text" icon={<TextFields />} label="Text" shortcut="T" />
      </ToolGroup>

      <ToolGroup>
        <ColorPicker color={strokeColor} onChange={setStrokeColor} label="Stroke" />
        <ColorPicker color={fillColor} onChange={setFillColor} label="Fill" />
        <StrokeWidthPicker value={strokeWidth} onChange={setStrokeWidth} />
      </ToolGroup>
    </Paper>
  )
}
