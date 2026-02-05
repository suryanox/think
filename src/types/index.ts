export type ElementType = 
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'text'
  | 'image'
  | 'disappearing-pen'

export interface Point {
  x: number
  y: number
  pressure?: number
}

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  points?: Point[]
  text?: string
  imageData?: string
  roughness?: number
  createdAt?: number
  fadeStartTime?: number
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface SelectionBounds {
  x: number
  y: number
  width: number
  height: number
}

export type ToolType = 
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'text'
  | 'image'
  | 'disappearing-pen'
  | 'pan'

export interface ToolState {
  activeTool: ToolType
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
}

export interface CanvasState {
  elements: CanvasElement[]
  selectedIds: string[]
  viewport: Viewport
  isDrawing: boolean
  currentElement: CanvasElement | null
}

export interface HistoryState {
  past: CanvasElement[][]
  future: CanvasElement[][]
}

export interface CanvasMouseEvent {
  clientX: number
  clientY: number
  canvasX: number
  canvasY: number
  pressure?: number
}

export type HandlePosition = 
  | 'nw' | 'n' | 'ne'
  | 'w' | 'e'
  | 'sw' | 's' | 'se'
  | 'rotate'

export interface TransformHandle {
  position: HandlePosition
  x: number
  y: number
  cursor: string
}
