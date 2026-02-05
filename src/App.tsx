import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { Canvas, Toolbar, TopBar, BottomBar } from './components'
import { useThemeStore } from './stores'
import { useKeyboard, useDisappearingInk } from './hooks'
import { useAutoSave } from './hooks/useAutoSave'
import { lightTheme, darkTheme } from './theme'

function App() {
  const { isDark } = useThemeStore()
  
  useKeyboard()
  useDisappearingInk()
  useAutoSave()

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Canvas />
        <Toolbar />
        <TopBar />
        <BottomBar />
      </Box>
    </ThemeProvider>
  )
}

export default App
