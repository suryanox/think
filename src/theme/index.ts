import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
})

export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8',
    },
    secondary: {
      main: '#f472b6',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
})

export const getCanvasBackground = (isDark: boolean) => 
  isDark ? '#1e293b' : '#ffffff'

export const getGridColor = (isDark: boolean) =>
  isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
