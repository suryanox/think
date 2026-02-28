import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import Prism from 'prismjs'
import 'prismjs/components/prism-rust'

const DEFAULT_RUST_CODE = `fn main() {
    println!("Hello, Rust!");
}`

const RUST_PLAYGROUND_URL = 'https://play.rust-lang.org/execute'

type BuildMode = 'debug' | 'release'
type Language = 'rust'

const LANGUAGES: { id: Language; label: string; prism: string }[] = [
  { id: 'rust', label: 'rust', prism: 'rust' },
]

const PRISM_THEME = {
  comment: '#5c6370',
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  function: '#61afef',
  operator: '#56b6c2',
  punctuation: '#abb2bf',
  className: '#e5c07b',
  variable: '#e06c75',
  builtin: '#56b6c2',
  macro: '#e06c75',
  attribute: '#d19a66',
  namespace: '#e5c07b',
}

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
  const [buildMode, setBuildMode] = useState<BuildMode>('debug')
  const [language, setLanguage] = useState<Language>('rust')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const highlightedCode = useMemo(() => {
    const langConfig = LANGUAGES.find((l) => l.id === language)
    const grammar = Prism.languages[langConfig?.prism || 'rust']
    if (!grammar) return code
    return Prism.highlight(code, grammar, langConfig?.prism || 'rust')
  }, [code, language])

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
    setOutput(`$ cargo run --${buildMode}\n   Compiling main.rs...\n`)

    try {
      const response = await fetch(RUST_PLAYGROUND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'stable',
          mode: buildMode,
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

      let outputText = `$ cargo run --${buildMode}\n   Compiling main.rs...\n`
      if (result.stderr) {
        outputText += result.stderr
      }
      if (result.stdout) {
        if (result.stderr) outputText += '\n'
        outputText += result.stdout
      }
      if (!result.success && !result.stderr && !result.stdout) {
        outputText += 'error: compilation failed with no output'
      }
      if (result.success) {
        outputText += '\n$'
      }

      setOutput(outputText)
    } catch (error) {
      setOutput(`error: ${error instanceof Error ? error.message : 'failed to execute'}`)
    } finally {
      setIsRunning(false)
    }
  }, [code, isRunning, buildMode])

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

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
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
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        bgcolor: '#0a0a0a',
        border: '1px solid #1a1a1a',
        userSelect: 'text',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
          bgcolor: '#0d0d0d',
          borderBottom: '1px solid #1a1a1a',
          cursor: 'move',
        }}
        className="code-drag-handle"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {LANGUAGES.map((lang) => (
            <Box
              key={lang.id}
              onClick={(e) => {
                e.stopPropagation()
                setLanguage(lang.id)
              }}
              sx={{
                px: 0.75,
                py: 0.25,
                cursor: 'pointer',
                color: language === lang.id ? '#00aaff' : '#3a3a3a',
                fontFamily: '"Fira Code", monospace',
                fontSize: '10px',
                textTransform: 'lowercase',
                letterSpacing: '0.5px',
                border: language === lang.id ? '1px solid #00aaff' : '1px solid transparent',
                userSelect: 'none',
                '&:hover': {
                  color: language === lang.id ? '#00aaff' : '#5a5a5a',
                },
              }}
            >
              {lang.label}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              onClick={(e) => {
                e.stopPropagation()
                setBuildMode('debug')
              }}
              sx={{
                px: 1,
                py: 0.25,
                cursor: 'pointer',
                color: buildMode === 'debug' ? '#00ff00' : '#3a3a3a',
                fontFamily: '"Fira Code", monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: buildMode === 'debug' ? '1px solid #00ff00' : '1px solid transparent',
                '&:hover': {
                  color: buildMode === 'debug' ? '#00ff00' : '#5a5a5a',
                },
              }}
            >
              debug
            </Box>
            <Box
              onClick={(e) => {
                e.stopPropagation()
                setBuildMode('release')
              }}
              sx={{
                px: 1,
                py: 0.25,
                cursor: 'pointer',
                color: buildMode === 'release' ? '#ff6600' : '#3a3a3a',
                fontFamily: '"Fira Code", monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: buildMode === 'release' ? '1px solid #ff6600' : '1px solid transparent',
                '&:hover': {
                  color: buildMode === 'release' ? '#ff6600' : '#5a5a5a',
                },
              }}
            >
              release
            </Box>
          </Box>

          <Box
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            sx={{
              color: '#3a3a3a',
              fontFamily: '"Fira Code", monospace',
              fontSize: '11px',
              cursor: 'pointer',
              '&:hover': { color: '#ff5555' },
            }}
          >
            [x]
          </Box>
        </Box>
      </Box>

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
              width: 36,
              bgcolor: '#0a0a0a',
              borderRight: '1px solid #1a1a1a',
              display: 'flex',
              flexDirection: 'column',
              pt: 0.5,
              overflow: 'hidden',
            }}
          >
            {code.split('\n').map((_, i) => (
              <Typography
                key={i}
                sx={{
                  color: '#2a2a2a',
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '12px',
                  lineHeight: '18px',
                  textAlign: 'right',
                  pr: 1,
                  userSelect: 'none',
                }}
              >
                {String(i + 1).padStart(3, ' ')}
              </Typography>
            ))}
          </Box>
          <Box
            sx={{
              flex: 1,
              ml: '36px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              component="pre"
              ref={highlightRef}
              aria-hidden="true"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                m: 0,
                p: 0.5,
                overflow: 'auto',
                pointerEvents: 'none',
                fontFamily: '"Fira Code", monospace',
                fontSize: '12px',
                lineHeight: '18px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: '#abb2bf',
                '& .token.comment': { color: PRISM_THEME.comment, fontStyle: 'italic' },
                '& .token.keyword': { color: PRISM_THEME.keyword },
                '& .token.string, & .token.char': { color: PRISM_THEME.string },
                '& .token.number': { color: PRISM_THEME.number },
                '& .token.function': { color: PRISM_THEME.function },
                '& .token.operator': { color: PRISM_THEME.operator },
                '& .token.punctuation': { color: PRISM_THEME.punctuation },
                '& .token.class-name, & .token.type': { color: PRISM_THEME.className },
                '& .token.variable': { color: PRISM_THEME.variable },
                '& .token.builtin': { color: PRISM_THEME.builtin },
                '& .token.macro, & .token.macro-name': { color: PRISM_THEME.macro },
                '& .token.attribute': { color: PRISM_THEME.attribute },
                '& .token.namespace': { color: PRISM_THEME.namespace },
                '& .token.lifetime': { color: PRISM_THEME.attribute },
              }}
              dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
            />
            <Box
              component="textarea"
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={syncScroll}
              spellCheck={false}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                m: 0,
                p: 0.5,
                bgcolor: 'transparent',
                color: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: '"Fira Code", monospace',
                fontSize: '12px',
                lineHeight: '18px',
                overflow: 'auto',
                caretColor: '#00ff00',
                '&::selection': {
                  bgcolor: '#264f78',
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.25,
            bgcolor: '#0d0d0d',
            borderTop: '1px solid #1a1a1a',
            borderBottom: '1px solid #1a1a1a',
          }}
        >
          <Typography
            sx={{
              color: '#2a2a2a',
              fontFamily: '"Fira Code", monospace',
              fontSize: '10px',
            }}
          >
            {isRunning ? '-- COMPILING --' : '-- READY --'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              sx={{
                color: '#2a2a2a',
                fontFamily: '"Fira Code", monospace',
                fontSize: '10px',
              }}
            >
              ^⏎ run
            </Typography>
            <Box
              onClick={(e) => {
                e.stopPropagation()
                if (!isRunning) executeCode()
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                color: isRunning ? '#2a2a2a' : '#00ff00',
                fontFamily: '"Fira Code", monospace',
                fontSize: '10px',
                border: `1px solid ${isRunning ? '#1a1a1a' : '#00ff00'}`,
                '&:hover': {
                  bgcolor: isRunning ? 'transparent' : 'rgba(0, 255, 0, 0.1)',
                },
              }}
            >
              {isRunning ? (
                <CircularProgress size={8} sx={{ color: '#2a2a2a' }} />
              ) : (
                '▶'
              )}
              <span>run</span>
            </Box>
          </Box>
        </Box>

        <Box
          ref={outputRef}
          sx={{
            height: 120,
            overflow: 'auto',
            bgcolor: '#050505',
            p: 1,
          }}
        >
          <Typography
            component="pre"
            sx={{
              color: '#6a6a6a',
              fontFamily: '"Fira Code", monospace',
              fontSize: '11px',
              lineHeight: 1.6,
              m: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              '& .prompt': {
                color: '#00ff00',
              },
            }}
          >
            {output || '$'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
