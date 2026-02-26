import { useState, useRef, useEffect, useCallback } from 'react'
import { Box, IconButton, Typography, CircularProgress } from '@mui/material'
import { PlayArrow, Close, ContentCopy, Check } from '@mui/icons-material'

const DEFAULT_RUST_CODE = `fn main() {
    println!("Hello, Rust!");
}`

const RUST_PLAYGROUND_URL = 'https://play.rust-lang.org/execute'

interface PlaygroundResponse {
  success: boolean
  stdout: string
  stderr: string
}

interface CodeProps {
  onClose?: () => void
  initialCode?: string
  onCodeChange?: (code: string) => void
}

export function Code({ onClose, initialCode = DEFAULT_RUST_CODE, onCodeChange }: CodeProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode)
      onCodeChange?.(newCode)
    },
    [onCodeChange]
  )

  const executeCode = useCallback(async () => {
    if (isRunning) return

    setIsRunning(true)
    setOutput('Compiling...\n')

    try {
      const response = await fetch(RUST_PLAYGROUND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'stable',
          mode: 'debug',
          edition: '2024',
          crateType: 'bin',
          tests: false,
          code,
          backtrace: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: PlaygroundResponse = await response.json()

      let outputText = ''
      if (result.stderr) {
        outputText += result.stderr
      }
      if (result.stdout) {
        outputText += result.stdout
      }
      if (!result.success && !outputText) {
        outputText = 'Compilation failed with no output'
      }

      setOutput(outputText || 'Program finished with no output')
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to execute code'}`)
    } finally {
      setIsRunning(false)
    }
  }, [code, isRunning])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation()
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        executeCode()
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = textareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newCode = code.substring(0, start) + '    ' + code.substring(end)
          handleCodeChange(newCode)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 4
          }, 0)
        }
      }
    },
    [code, executeCode, handleCodeChange]
  )

  const copyCode = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <Box
      onMouseDown={stopPropagation}
      onMouseMove={stopPropagation}
      onMouseUp={stopPropagation}
      sx={{
        width: 800,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        bgcolor: '#1e1e1e',
        border: '1px solid #333',
        userSelect: 'text',
      }}
    >
      {/* Title bar - draggable area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.75,
          bgcolor: '#2d2d2d',
          borderBottom: '1px solid #333',
          cursor: 'move',
        }}
        className="code-drag-handle"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#ff5f57',
              cursor: 'pointer',
              '&:hover': { filter: 'brightness(1.2)' },
            }}
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#febc2e',
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#28c840',
            }}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: '#888',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            userSelect: 'none',
          }}
        >
          main.rs — Rust Playground
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              copyCode()
            }}
            sx={{ color: '#888', p: 0.5 }}
          >
            {copied ? <Check sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            sx={{ color: '#888', p: 0.5 }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Editor */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            minHeight: 0,
            display: 'flex',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 40,
              bgcolor: '#252526',
              borderRight: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              pt: 1,
              overflow: 'hidden',
            }}
          >
            {code.split('\n').map((_, i) => (
              <Typography
                key={i}
                sx={{
                  color: '#858585',
                  fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                  fontSize: '13px',
                  lineHeight: '20px',
                  textAlign: 'right',
                  pr: 1,
                  userSelect: 'none',
                }}
              >
                {i + 1}
              </Typography>
            ))}
          </Box>
          <Box
            component="textarea"
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            sx={{
              flex: 1,
              ml: '40px',
              p: 1,
              pt: 1,
              bgcolor: 'transparent',
              color: '#d4d4d4',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
              fontSize: '13px',
              lineHeight: '20px',
              overflow: 'auto',
              '&::placeholder': {
                color: '#666',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.5,
            bgcolor: '#252526',
            borderTop: '1px solid #333',
            borderBottom: '1px solid #333',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontFamily: 'monospace',
              fontSize: '0.7rem',
            }}
          >
            {isRunning ? 'Running...' : '⌘+Enter to run'}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              executeCode()
            }}
            disabled={isRunning}
            sx={{
              bgcolor: '#0e7a0d',
              color: '#fff',
              borderRadius: 1,
              px: 1.5,
              py: 0.25,
              '&:hover': {
                bgcolor: '#0c6b0c',
              },
              '&:disabled': {
                bgcolor: '#333',
                color: '#666',
              },
            }}
          >
            {isRunning ? (
              <CircularProgress size={14} sx={{ color: '#fff' }} />
            ) : (
              <>
                <PlayArrow sx={{ fontSize: 16 }} />
                <Typography
                  variant="caption"
                  sx={{ ml: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
                >
                  Run
                </Typography>
              </>
            )}
          </IconButton>
        </Box>

        <Box
          ref={outputRef}
          sx={{
            height: 100,
            overflow: 'auto',
            bgcolor: '#1a1a1a',
            p: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#569cd6',
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              mb: 0.5,
              display: 'block',
            }}
          >
            {'>'} Console
          </Typography>
          <Typography
            component="pre"
            sx={{
              color: '#cccccc',
              fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
              fontSize: '12px',
              lineHeight: 1.5,
              m: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {output || '// Output will appear here...'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
