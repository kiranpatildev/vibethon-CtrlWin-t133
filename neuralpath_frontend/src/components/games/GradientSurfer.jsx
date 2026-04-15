import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

// Loss landscape: y = (x - 3)^2 + 1, global min at x=3
const lossFunc = x => (x - 3) ** 2 + 1
const lossGrad = x => 2 * (x - 3)

const W = 360, H = 200
const xMin = -1, xMax = 7
const toSVG = (x, y) => ({
  sx: ((x - xMin) / (xMax - xMin)) * W,
  sy: H - Math.min(Math.max((y / 22) * H, 0), H),
})

// Build curve points
const CURVE = []
for (let i = 0; i <= 100; i++) {
  const x = xMin + (i / 100) * (xMax - xMin)
  const y = lossFunc(x)
  const { sx, sy } = toSVG(x, y)
  CURVE.push(`${sx},${sy}`)
}
const CURVE_PATH = `M ${CURVE.join(' L ')}`

const PRESETS = [
  { name: 'Good LR (0.1)', lr: 0.1, color: 'text-neural-success' },
  { name: 'Too Large (1.5)', lr: 1.5, color: 'text-neural-danger' },
  { name: 'Too Small (0.005)', lr: 0.005, color: 'text-neural-xp' },
]

export default function GradientSurfer() {
  const [lr, setLr] = useState(0.1)
  const [x, setX] = useState(0)
  const [history, setHistory] = useState([{ x: 0, loss: lossFunc(0) }])
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(300)
  const intervalRef = useRef(null)

  const step = useCallback((currentX) => {
    const grad = lossGrad(currentX)
    const nextX = currentX - lr * grad
    return nextX
  }, [lr])

  const startRun = () => {
    const startX = parseFloat((Math.random() * 4 - 1).toFixed(2))
    setX(startX)
    setHistory([{ x: startX, loss: lossFunc(startX) }])
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setX(prev => {
        const next = step(prev)
        const loss = lossFunc(next)
        setHistory(h => [...h.slice(-30), { x: next, loss }])
        // Stop if converged
        if (Math.abs(lossGrad(next)) < 0.01 || Math.abs(next - 3) < 0.05) {
          clearInterval(intervalRef.current)
          setRunning(false)
        }
        return next
      })
    }, speed)
    return () => clearInterval(intervalRef.current)
  }, [running, step, speed])

  const stopRun = () => { setRunning(false); clearInterval(intervalRef.current) }

  const pos = toSVG(x, lossFunc(x))
  const currentLoss = lossFunc(x).toFixed(3)
  const converged = Math.abs(x - 3) < 0.1

  return (
    <div className="card">
      <p className="text-neural-muted text-sm mb-4">
        Watch gradient descent find the minimum of <code className="text-neural-accent">L(x) = (x − 3)² + 1</code>.
        The ball rolls down the loss curve. Learning rate controls how far it steps each time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-neural-muted">Learning Rate</label>
              <span className="text-neural-accent font-mono text-sm">{lr}</span>
            </div>
            <input type="range" min="0.001" max="2" step="0.001" value={lr}
              onChange={e => { setLr(parseFloat(e.target.value)); stopRun() }}
              className="w-full accent-[#00D4FF]" />
            <div className="flex justify-between text-xs text-neural-muted mt-1">
              <span>0.001</span><span>2.0</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neural-muted block mb-2">Presets</label>
            <div className="space-y-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => { setLr(p.lr); stopRun() }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all
                    ${lr === p.lr ? 'border-neural-accent bg-neural-accent/10' : 'border-neural-border hover:border-neural-accent/30'}
                    ${p.color}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neural-muted block mb-2">Animation speed</label>
            <div className="flex gap-2">
              {[500, 300, 100].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${speed === s ? 'border-neural-accent bg-neural-accent/10 text-neural-accent' : 'border-neural-border text-neural-muted'}`}>
                  {s === 500 ? 'Slow' : s === 300 ? 'Normal' : 'Fast'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={startRun} disabled={running} className="btn-primary flex-1 text-sm">
              {running ? '...' : '▶ Start'}
            </button>
            <button onClick={stopRun} disabled={!running} className="btn-secondary flex-1 text-sm">⏸ Pause</button>
          </div>

          <div className="text-center">
            <div className="text-neural-muted text-xs mb-1">Current Loss</div>
            <div className={`font-heading font-bold text-2xl ${converged ? 'text-neural-success' : 'text-neural-xp'}`}>{currentLoss}</div>
            {converged && <div className="text-neural-success text-xs mt-1">Converged! x ≈ 3 ✓</div>}
            {lr > 1.2 && !converged && <div className="text-neural-danger text-xs mt-1">⚠ LR too large — may diverge!</div>}
          </div>
        </div>

        {/* SVG Loss landscape */}
        <div className="md:col-span-2">
          <div className="bg-neural-surface rounded-xl border border-neural-border p-2 overflow-hidden">
            <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} className="w-full">
              {/* Grid lines */}
              {[0, 5, 10, 15, 20].map(y => {
                const { sy } = toSVG(0, y)
                return <line key={y} x1="0" y1={sy} x2={W} y2={sy} stroke="#2A3A5C" strokeWidth="0.5" />
              })}

              {/* Loss curve */}
              <path d={CURVE_PATH} fill="none" stroke="#8B5CF6" strokeWidth="2.5" opacity="0.8" />
              <path d={CURVE_PATH + ` L ${W},${H} L 0,${H} Z`} fill="#8B5CF6" opacity="0.05" />

              {/* Minimum marker */}
              {(() => { const { sx, sy } = toSVG(3, 1); return (
                <>
                  <line x1={sx} y1={0} x2={sx} y2={H} stroke="#22C55E" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                  <text x={sx + 4} y={20} fill="#22C55E" fontSize="9">x=3 (min)</text>
                </>
              )})()}

              {/* History trail */}
              {history.slice(-20).map((h, i) => {
                const { sx, sy } = toSVG(h.x, h.loss)
                return <circle key={i} cx={sx} cy={sy} r="3" fill="#00D4FF" opacity={(i + 1) / 20 * 0.6} />
              })}

              {/* Current ball */}
              <motion.circle
                cx={pos.sx}
                cy={pos.sy}
                r="8"
                fill={converged ? '#22C55E' : '#00D4FF'}
                stroke={converged ? '#22C55E' : '#00D4FF'}
                strokeWidth="2"
                opacity="0.9"
                className={converged ? '' : 'drop-shadow-lg'}
              />

              {/* Axes labels */}
              <text x={W / 2} y={H + 22} textAnchor="middle" fill="#94A3B8" fontSize="10">x (parameter value)</text>
              <text x={8} y={15} fill="#94A3B8" fontSize="9">Loss</text>
            </svg>
          </div>

          {/* Step history mini chart */}
          <div className="mt-3 bg-neural-surface rounded-lg border border-neural-border p-3">
            <div className="text-xs text-neural-muted mb-2">Loss over steps</div>
            <svg width="100%" height="50" viewBox="0 0 300 50">
              {history.length > 1 && history.map((h, i) => {
                if (i === 0) return null
                const x1 = ((i - 1) / Math.max(history.length - 1, 1)) * 300
                const x2 = (i / Math.max(history.length - 1, 1)) * 300
                const maxLoss = Math.max(...history.map(h => h.loss), 1)
                const y1 = 50 - (history[i - 1].loss / maxLoss) * 45
                const y2 = 50 - (h.loss / maxLoss) * 45
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00D4FF" strokeWidth="1.5" />
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
