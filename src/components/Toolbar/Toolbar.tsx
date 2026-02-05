import { Box, Paper, Divider } from '@mui/material'
import {
  NearMe,
  CropSquare,
  RadioButtonUnchecked,
  Remove,
  TrendingFlat,
  Create,
  TextFields,
  Image,
  AutoFixHigh,
  PanTool,
} from '@mui/icons-material'
import { ToolButton } from './ToolButton'
import { ColorPicker } from './ColorPicker'
import { StrokeWidthPicker } from './StrokeWidthPicker'
import { useToolStore } from '../../stores'

export function Toolbar() {
  const { strokeColor, fillColor, strokeWidth, setStrokeColor, setFillColor, setStrokeWidth } =
    useToolStore()

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 1,
        borderRadius: 2,
        zIndex: 10,
      }}
    >
      <ToolButton tool="select" icon={<NearMe />} label="Select" shortcut="V" />
      <ToolButton tool="pan" icon={<PanTool />} label="Pan" shortcut="H" />
      <Divider sx={{ my: 0.5 }} />
      <ToolButton tool="rectangle" icon={<CropSquare />} label="Rectangle" shortcut="R" />
      <ToolButton tool="ellipse" icon={<RadioButtonUnchecked />} label="Ellipse" shortcut="O" />
      <ToolButton tool="line" icon={<Remove />} label="Line" shortcut="L" />
      <ToolButton tool="arrow" icon={<TrendingFlat />} label="Arrow" shortcut="A" />
      <Divider sx={{ my: 0.5 }} />
      <ToolButton tool="pen" icon={<Create />} label="Pen" shortcut="P" />
      <ToolButton tool="disappearing-pen" icon={<AutoFixHigh />} label="Disappearing Pen" shortcut="D" />
      <ToolButton tool="text" icon={<TextFields />} label="Text" shortcut="T" />
      <ToolButton tool="image" icon={<Image />} label="Image" />
      <Divider sx={{ my: 0.5 }} />
      <ColorPicker color={strokeColor} onChange={setStrokeColor} label="Stroke color" />
      <ColorPicker color={fillColor} onChange={setFillColor} label="Fill color" />
      <StrokeWidthPicker value={strokeWidth} onChange={setStrokeWidth} />
    </Paper>
  )
}
