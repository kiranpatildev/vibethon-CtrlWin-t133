import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CARDS = [
  { id: 1, text: 'WIN A FREE IPHONE NOW!!!', label: 'spam', hint: 'All-caps urgent prize claim' },
  { id: 2, text: 'Your invoice for this month is attached.', label: 'ham', hint: 'Professional business email' },
  { id: 3, text: 'CLICK HERE to claim your $1000 reward', label: 'spam', hint: 'Urgent call-to-action with large prize' },
  { id: 4, text: "Hi team, meeting at 3pm Thursday.", label: 'ham', hint: 'Normal workplace communication' },
  { id: 5, text: 'Congratulations! You are our lucky winner!', label: 'spam', hint: 'Winner notification without prior entry' },
  { id: 6, text: 'Please find the report I mentioned.', label: 'ham', hint: 'Professional follow-up' },
  { id: 7, text: 'V1AGRA cheap prices act now!!!', label: 'spam', hint: 'Misspelled drug, excessive punctuation' },
  { id: 8, text: "Don't forget the standup at 10am.", label: 'ham', hint: 'Routine work reminder' },
  { id: 9, text: 'URGENT: Your account will be suspended!', label: 'spam', hint: 'Fear-based urgency tactic' },
  { id: 10, text: 'Lunch options for today attached.', label: 'ham', hint: 'Normal casual message' },
]

export default function SortTheData() {
  const [cards, setCards] = useState(CARDS)
  const [sorted, setSorted] = useState({ spam: [], ham: [] })
  const [feedback, setFeedback] = useState({})
  const [done, setDone] = useState(false)
  const [showHint, setShowHint] = useState(null)

  const handleSort = useCallback((card, bucket) => {
    const correct = card.label === bucket
    setFeedback(f => ({ ...f, [card.id]: correct ? 'correct' : 'wrong' }))

    setTimeout(() => {
      setCards(c => c.filter(c => c.id !== card.id))
      setSorted(s => ({ ...s, [bucket]: [...s[bucket], { ...card, correct }] }))
      setFeedback(f => { const n = { ...f }; delete n[card.id]; return n })
      if (cards.length === 1) setDone(true)
    }, 600)
  }, [cards])

  const accuracy = sorted.spam.length + sorted.ham.length > 0
    ? Math.round(([...sorted.spam, ...sorted.ham].filter(c => c.correct).length / ([...sorted.spam, ...sorted.ham].length)) * 100)
    : null

  const reset = () => { setCards(CARDS); setSorted({ spam: [], ham: [] }); setFeedback({}); setDone(false) }

  const current = cards[0]

  return (
    <div className="card">
      <p className="text-neural-muted text-sm mb-6">
        Classify each email as <span className="text-neural-danger font-semibold">SPAM</span> or <span className="text-neural-success font-semibold">HAM</span> (legitimate). 
        This is binary classification — just like a trained ML model!
      </p>

      {!done ? (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-neural-muted">
            <span>{CARDS.length - cards.length}/{CARDS.length} classified</span>
            {accuracy !== null && <span>Accuracy so far: <span className="text-neural-accent font-bold">{accuracy}%</span></span>}
          </div>
          <div className="progress-bar h-1.5">
            <div className="progress-fill h-full" style={{ width: `${((CARDS.length - cards.length) / CARDS.length) * 100}%` }} />
          </div>

          {/* Card */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{
                    opacity: 1, scale: 1, y: 0,
                    borderColor: feedback[current.id] === 'correct' ? '#22C55E' : feedback[current.id] === 'wrong' ? '#EF4444' : undefined
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="card max-w-md w-full text-center relative"
                >
                  {feedback[current.id] === 'correct' && <div className="absolute top-2 right-2 text-neural-success text-xl">✓</div>}
                  {feedback[current.id] === 'wrong' && <div className="absolute top-2 right-2 text-neural-danger text-xl">✗</div>}
                  <p className="text-neural-text font-medium text-lg leading-relaxed mb-2">"{current.text}"</p>
                  <button
                    className="text-neural-muted text-xs underline mt-1"
                    onMouseEnter={() => setShowHint(current.id)}
                    onMouseLeave={() => setShowHint(null)}
                  >💡 hint</button>
                  {showHint === current.id && (
                    <div className="mt-2 text-xs text-neural-xp bg-neural-xp/10 rounded-lg px-3 py-2">{current.hint}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => current && handleSort(current, 'spam')}
              disabled={!current || !!feedback[current?.id]}
              className="px-8 py-3 rounded-xl border-2 border-neural-danger/60 bg-neural-danger/10 text-neural-danger font-heading font-bold hover:bg-neural-danger/20 active:scale-95 transition-all disabled:opacity-40"
            >
              🚫 SPAM
            </button>
            <button
              onClick={() => current && handleSort(current, 'ham')}
              disabled={!current || !!feedback[current?.id]}
              className="px-8 py-3 rounded-xl border-2 border-neural-success/60 bg-neural-success/10 text-neural-success font-heading font-bold hover:bg-neural-success/20 active:scale-95 transition-all disabled:opacity-40"
            >
              ✅ HAM
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="text-6xl mb-4">{accuracy === 100 ? '🏆' : accuracy >= 80 ? '🎯' : '📚'}</div>
          <div className={`font-heading text-5xl font-bold mb-2 ${accuracy >= 80 ? 'text-neural-success' : 'text-neural-xp'}`}>{accuracy}%</div>
          <p className="text-neural-muted mb-2">Accuracy on {CARDS.length} emails</p>
          <p className="text-neural-muted text-sm mb-6">
            {accuracy === 100 ? 'Perfect classifier! You understood all the spam patterns.' : `You got ${[...sorted.spam, ...sorted.ham].filter(c => c.correct).length} out of ${CARDS.length} correct.`}
          </p>
          <button onClick={reset} className="btn-primary">Play Again</button>
        </motion.div>
      )}
    </div>
  )
}
