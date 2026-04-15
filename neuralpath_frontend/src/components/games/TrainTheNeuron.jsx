import { useState, useMemo } from 'react'

// Tiny toy dataset for the neuron to classify
const TOY_DATA = [
  { x1: 0.2, x2: 0.8, label: 1 },
  { x1: 0.9, x2: 0.1, label: 0 },
  { x1: 0.3, x2: 0.7, label: 1 },
  { x1: 0.8, x2: 0.3, label: 0 },
  { x1: 0.1, x2: 0.9, label: 1 },
  { x1: 0.7, x2: 0.2, label: 0 },
  { x1: 0.4, x2: 0.6, label: 1 },
  { x1: 0.85, x2: 0.15, label: 0 },
]

const sigmoid = x => 1 / (1 + Math.exp(-x))
const relu = x => Math.max(0, x)
const tanh = x => Math.tanh(x)

const ACTIVATIONS = { sigmoid, relu, tanh }

export default function TrainTheNeuron() {
  const [w1, setW1] = useState(0.5)
  const [w2, setW2] = useState(-0.3)
  const [bias, setBias] = useState(0.1)
  const [activation, setActivation] = useState('sigmoid')

  const predictions = useMemo(() => {
    const fn = ACTIVATIONS[activation]
    return TOY_DATA.map(d => {
      const z = d.x1 * w1 + d.x2 * w2 + bias
      const output = fn(z)
      const predicted = output >= 0.5 ? 1 : 0
      return { ...d, output: output.toFixed(3), predicted, correct: predicted === d.label }
    })
  }, [w1, w2, bias, activation])

  const accuracy = Math.round((predictions.filter(p => p.correct).length / predictions.length) * 100)
  const neuronOutput = sigmoid(0.5 * w1 + 0.5 * w2 + bias).toFixed(3)

  const feedbackMsg = accuracy === 100
    ? '🎉 Perfect! You separated the data!'
    : accuracy >= 75
    ? `👍 ${accuracy}% — try tweaking W1 or W2`
    : accuracy >= 50
    ? `⚡ ${accuracy}% — keep adjusting the weights`
    : `🔧 ${accuracy}% — the model is struggling`

  return (
    <div className="card">
      <p className="text-neural-muted text-sm mb-6">
        Adjust weights and bias to classify 8 toy data points. The neuron computes: <code className="text-neural-accent">output = activation(x1·W1 + x2·W2 + b)</code>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          {[
            { label: 'Weight 1 (W1)', val: w1, set: setW1, color: 'text-neural-accent' },
            { label: 'Weight 2 (W2)', val: w2, set: setW2, color: 'text-neural-purple' },
            { label: 'Bias (b)', val: bias, set: setBias, min: -1, max: 1, color: 'text-neural-xp' },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between mb-2">
                <label className={`text-sm font-medium ${s.color}`}>{s.label}</label>
                <span className="text-neural-text font-mono text-sm">{Number(s.val).toFixed(1)}</span>
              </div>
              <input type="range" min={s.min ?? -2} max={s.max ?? 2} step="0.1"
                value={s.val} onChange={e => s.set(parseFloat(e.target.value))}
                className="w-full accent-[#00D4FF]" />
            </div>
          ))}

          {/* Activation selector */}
          <div>
            <label className="text-sm font-medium text-neural-muted mb-2 block">Activation Function</label>
            <div className="flex gap-2">
              {['sigmoid', 'relu', 'tanh'].map(fn => (
                <button key={fn} onClick={() => setActivation(fn)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-mono transition-all
                    ${activation === fn ? 'border-neural-accent bg-neural-accent/10 text-neural-accent' : 'border-neural-border text-neural-muted hover:border-neural-accent/40'}`}>
                  {fn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Neuron visualization + results */}
        <div className="space-y-4">
          {/* SVG Neuron */}
          <div className="bg-neural-surface rounded-xl p-4 flex items-center justify-center">
            <svg width="260" height="140" viewBox="0 0 260 140">
              {/* Input nodes */}
              <circle cx="30" cy="45" r="18" fill="#1A2235" stroke="#2A3A5C" strokeWidth="2" />
              <text x="30" y="50" textAnchor="middle" fill="#94A3B8" fontSize="10">x1</text>
              <circle cx="30" cy="95" r="18" fill="#1A2235" stroke="#2A3A5C" strokeWidth="2" />
              <text x="30" y="100" textAnchor="middle" fill="#94A3B8" fontSize="10">x2</text>

              {/* Connections */}
              <line x1="48" y1="45" x2="118" y2="70" stroke={w1 > 0 ? '#00D4FF' : '#EF4444'} strokeWidth={Math.abs(w1) * 2 + 0.5} opacity="0.7" />
              <line x1="48" y1="95" x2="118" y2="70" stroke={w2 > 0 ? '#8B5CF6' : '#EF4444'} strokeWidth={Math.abs(w2) * 2 + 0.5} opacity="0.7" />
              <text x="75" y="52" fill="#00D4FF" fontSize="9">{w1.toFixed(1)}</text>
              <text x="75" y="105" fill="#8B5CF6" fontSize="9">{w2.toFixed(1)}</text>

              {/* Neuron body */}
              <circle cx="136" cy="70" r="28" fill="#1A2235" stroke="#00D4FF" strokeWidth="2" className="animate-pulse-slow" />
              <text x="136" y="66" textAnchor="middle" fill="#00D4FF" fontSize="9">{activation}</text>
              <text x="136" y="80" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="bold">{neuronOutput}</text>

              {/* Bias */}
              <text x="136" y="115" textAnchor="middle" fill="#FFB347" fontSize="9">b={bias.toFixed(1)}</text>

              {/* Output connection */}
              <line x1="164" y1="70" x2="224" y2="70" stroke="#22C55E" strokeWidth="2" />
              <circle cx="232" cy="70" r="18" fill={parseFloat(neuronOutput) >= 0.5 ? '#22C55E20' : '#EF444420'}
                stroke={parseFloat(neuronOutput) >= 0.5 ? '#22C55E' : '#EF4444'} strokeWidth="2" />
              <text x="232" y="75" textAnchor="middle" fill={parseFloat(neuronOutput) >= 0.5 ? '#22C55E' : '#EF4444'} fontSize="10">
                {parseFloat(neuronOutput) >= 0.5 ? '1' : '0'}
              </text>
            </svg>
          </div>

          {/* Accuracy */}
          <div className="text-center">
            <div className={`font-heading font-bold text-4xl ${accuracy === 100 ? 'text-neural-success' : accuracy >= 75 ? 'text-neural-accent' : 'text-neural-xp'}`}>
              {accuracy}%
            </div>
            <div className="text-neural-muted text-sm mt-1">Accuracy on toy dataset</div>
            <div className="text-sm mt-2">{feedbackMsg}</div>
          </div>

          {/* Data points */}
          <div className="grid grid-cols-4 gap-1.5">
            {predictions.map((p, i) => (
              <div key={i} className={`rounded-lg p-2 text-center text-[10px] border ${p.correct ? 'border-neural-success/40 bg-neural-success/10' : 'border-neural-danger/40 bg-neural-danger/10'}`}>
                <div className="font-mono text-neural-muted">{p.x1},{p.x2}</div>
                <div className={p.correct ? 'text-neural-success' : 'text-neural-danger'}>{p.correct ? '✓' : '✗'} {p.predicted}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
