import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { api } from '../lib/api'
import { runPython, loadPyodideOnce } from '../lib/pyodide'
import toast from 'react-hot-toast'

const STARTER = `# Welcome to NeuralPath Code Lab!
# Python runs entirely in your browser via Pyodide.

import numpy as np

# Try a quick example:
data = np.array([1, 2, 3, 4, 5])
print("Mean:", np.mean(data))
print("Std:", np.std(data))
print("Hello from NeuralPath!")
`

export default function CodeLab() {
  const [code, setCode] = useState(STARTER)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [pyLoading, setPyLoading] = useState(false)
  const [pyReady, setPyReady] = useState(false)
  const [hint, setHint] = useState('')
  const [hintLoading, setHintLoading] = useState(false)
  const [challenge, setChallenge] = useState('Explore and analyze a dataset using NumPy and Pandas')
  const outputRef = useRef(null)

  // Preload Pyodide lazily when user visits Code Lab
  useEffect(() => {
    setPyLoading(true)
    loadPyodideOnce((msg) => {
      setOutput(`⏳ ${msg}`)
    }).then(() => {
      setPyReady(true)
      setOutput('✅ Python environment ready! Click Run to execute your code.')
      setPyLoading(false)
    }).catch(err => {
      setError(`Failed to load Pyodide: ${err.message}`)
      setPyLoading(false)
    })
  }, [])

  const handleRun = async () => {
    if (!pyReady || running) return
    setRunning(true)
    setOutput('')
    setError('')
    const { output: out, error: err } = await runPython(code)
    setOutput(out)
    setError(err || '')
    setRunning(false)
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
    // Award code_runner badge hint via localStorage
    localStorage.setItem('np_code_runner', '1')
  }

  const handleHint = async () => {
    if (!challenge || hintLoading) return
    setHintLoading(true)
    try {
      const data = await api.getHint(code, challenge)
      setHint(data.hint)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setHintLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neural-text">Code Lab</h1>
          <p className="text-neural-muted text-sm">Python runs in your browser — no installation needed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${pyReady ? 'border-neural-success/40 text-neural-success' : 'border-neural-xp/40 text-neural-xp'}`}>
            <span className={`w-2 h-2 rounded-full ${pyReady ? 'bg-neural-success animate-pulse' : 'bg-neural-xp animate-spin'}`} />
            {pyReady ? 'Python Ready' : pyLoading ? 'Loading Python...' : 'Not loaded'}
          </div>
          <button onClick={handleHint} disabled={hintLoading || !pyReady} className="btn-secondary text-sm flex items-center gap-2">
            {hintLoading ? <span className="w-3 h-3 border border-neural-muted border-t-transparent rounded-full animate-spin" /> : '💡'}
            Get Hint
          </button>
          <button id="run-code" onClick={handleRun} disabled={!pyReady || running} className="btn-primary text-sm flex items-center gap-2">
            {running ? <span className="w-3 h-3 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" /> : '▶'}
            Run
          </button>
        </div>
      </div>

      {/* Challenge input */}
      <div className="card mb-4">
        <label className="text-xs text-neural-muted mb-1 block">Current Challenge (for AI hints)</label>
        <input
          className="input text-sm"
          value={challenge}
          onChange={e => setChallenge(e.target.value)}
          placeholder="Describe what you're trying to do..."
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Monaco Editor */}
        <div className="rounded-xl overflow-hidden border border-neural-border">
          <div className="bg-neural-surface px-4 py-2 border-b border-neural-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-neural-muted text-xs font-mono ml-2">main.py</span>
          </div>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={val => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono", monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'line',
            }}
          />
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-xl border border-neural-border bg-neural-surface overflow-hidden flex flex-col">
            <div className="bg-neural-surface px-4 py-2 border-b border-neural-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-neural-border" />
                <div className="w-3 h-3 rounded-full bg-neural-border" />
                <div className="w-3 h-3 rounded-full bg-neural-border" />
              </div>
              <span className="text-neural-muted text-xs font-mono ml-2">output</span>
            </div>
            <div ref={outputRef} className="flex-1 p-4 font-mono text-sm overflow-auto">
              {error ? (
                <pre className="text-neural-danger whitespace-pre-wrap">{error}</pre>
              ) : (
                <pre className="text-neural-success whitespace-pre-wrap">{output || 'Run your code to see output here...'}</pre>
              )}
            </div>
          </div>

          {/* AI Hint display */}
          {hint && (
            <div className="card border-neural-xp/30 bg-neural-xp/5">
              <div className="flex items-start gap-2">
                <span className="text-xl">💡</span>
                <div>
                  <div className="text-neural-xp text-xs font-semibold mb-1">AI Hint</div>
                  <p className="text-neural-text text-sm leading-relaxed">{hint}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
