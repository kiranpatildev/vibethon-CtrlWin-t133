import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuizArena() {
  const { moduleSlug } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300)
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiDifficulty, setAiDifficulty] = useState('medium')
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getQuiz(moduleSlug)
        setQuiz(data)
      } catch {
        // No quiz found — will show AI generator
      }
      setLoading(false)
    }
    load()
  }, [moduleSlug])

  // Timer — uses useRef to avoid stale closure
  useEffect(() => {
    if (!started || submitted) return
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [started])

  const handleAnswer = (questionId, answerIndex) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [String(questionId)]: answerIndex }))
  }

  const handleSubmit = async () => {
    if (submitting || !quiz) return
    setSubmitting(true)
    clearInterval(intervalRef.current)
    const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 300 - timeLeft
    try {
      const data = await api.submitQuiz(quiz.id, answers, timeTaken)
      setResults(data)
      setSubmitted(true)
      if (data.percentage >= 70) toast.success(`+${data.xp_earned} XP! Score: ${data.percentage}%`)
      else toast.error(`Score: ${data.percentage}% — try again!`)
    } catch (e) { toast.error(e.message) }
    finally { setSubmitting(false) }
  }

  const handleGenerateAI = async () => {
    if (!aiTopic || generating) return
    setGenerating(true)
    try {
      const data = await api.generateQuiz(aiTopic, aiDifficulty, 5)
      // Build a local quiz object from AI response
      const aiQuiz = {
        id: 'ai-' + Date.now(),
        title: `AI Quiz: ${aiTopic}`,
        difficulty: aiDifficulty,
        is_ai_generated: true,
        questions: data.questions.map((q, i) => ({ id: i, ...q, order: i })),
      }
      setQuiz(aiQuiz)
      setAnswers({})
      setSubmitted(false)
      setResults(null)
      setStarted(false)
      setTimeLeft(300)
      toast.success('AI quiz generated!')
    } catch (e) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const resetQuiz = () => {
    setAnswers({}); setSubmitted(false); setResults(null); setStarted(false); setTimeLeft(300)
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = String(timeLeft % 60).padStart(2, '0')
  const answeredCount = Object.keys(answers).length
  const totalQ = quiz?.questions?.length || 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neural-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-neural-text">Quiz Arena</h1>
        <p className="text-neural-muted text-sm mt-1">Test your knowledge. Pass with 70%+ to earn XP.</p>
      </div>

      {/* AI Quiz Generator */}
      {!quiz && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-heading font-semibold text-neural-text">Generate AI Quiz</h3>
              <p className="text-neural-muted text-xs">Gemini creates fresh questions on any AIML topic</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input className="input flex-1 text-sm" placeholder="Topic e.g. 'Convolutional Neural Networks'" value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
            <select className="input w-32 text-sm" value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button onClick={handleGenerateAI} disabled={!aiTopic || generating} className="btn-primary text-sm flex items-center gap-2">
              {generating ? <span className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" /> : '✨'}
              Generate
            </button>
          </div>
        </div>
      )}

      {quiz && !started && !submitted && (
        <div className="card text-center mb-6">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="font-heading text-2xl font-bold text-neural-text mb-2">{quiz.title}</h2>
          <p className="text-neural-muted mb-2">{totalQ} questions · {quiz.difficulty} difficulty · 5:00 timer</p>
          {quiz.is_ai_generated && <div className="badge-purple mb-4 inline-flex">✨ AI Generated</div>}
          <br />
          <button onClick={() => setStarted(true)} className="btn-primary px-10">Begin Quiz →</button>
          <div className="mt-4">
            <button onClick={() => { setQuiz(null); resetQuiz() }} className="btn-ghost text-sm">← Generate different quiz</button>
          </div>
        </div>
      )}

      {quiz && started && !submitted && (
        <>
          {/* Timer + progress bar */}
          <div className="card mb-4 flex items-center justify-between">
            <div className="text-sm text-neural-muted">{answeredCount}/{totalQ} answered</div>
            <div className={`font-heading font-bold text-xl tabular-nums ${timeLeft < 60 ? 'text-neural-danger' : 'text-neural-accent'}`}>
              {mins}:{secs}
            </div>
          </div>
          <div className="progress-bar h-1.5 mb-6">
            <div className="progress-fill h-full" style={{ width: `${(answeredCount / totalQ) * 100}%` }} />
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {quiz.questions.map((q, qi) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}>
                <div className="card">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-neural-surface border border-neural-border flex items-center justify-center text-xs font-heading font-bold text-neural-muted flex-shrink-0">{qi + 1}</div>
                    <p className="text-neural-text font-medium leading-relaxed">{q.question_text}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 ml-10">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => handleAnswer(q.id, oi)}
                        className={`text-left px-4 py-3 rounded-lg border text-sm transition-all
                          ${answers[String(q.id)] === oi
                            ? 'border-neural-accent bg-neural-accent/10 text-neural-accent'
                            : 'border-neural-border text-neural-muted hover:border-neural-accent/40 hover:text-neural-text'
                          }`}
                      >
                        <span className="font-mono mr-2 text-neural-muted">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            {submitting ? <span className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" /> : null}
            Submit Quiz ({answeredCount}/{totalQ} answered)
          </button>
        </>
      )}

      {/* Results */}
      {submitted && results && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="card text-center mb-6">
            <div className="text-6xl mb-4">{results.percentage >= 70 ? '🏆' : results.percentage >= 50 ? '💪' : '📚'}</div>
            <div className={`font-heading text-5xl font-bold mb-2 ${results.percentage >= 70 ? 'text-neural-success' : 'text-neural-xp'}`}>
              {results.percentage}%
            </div>
            <p className="text-neural-muted mb-2">{results.score}/{results.max_score} correct · {results.time_taken}s</p>
            {results.xp_earned > 0 && <div className="badge-xp inline-flex mb-4">+{results.xp_earned} XP earned!</div>}
          </div>

          {/* Question breakdown */}
          <div className="space-y-3 mb-6">
            {results.question_results?.map((qr, i) => {
              const q = quiz.questions.find(q => String(q.id) === String(qr.question_id))
              return q ? (
                <div key={i} className={`card border-l-4 ${qr.correct ? 'border-l-neural-success' : 'border-l-neural-danger'}`}>
                  <p className="text-neural-text text-sm font-medium mb-2">{q.question_text}</p>
                  <p className="text-neural-muted text-xs">
                    Your answer: <span className={qr.correct ? 'text-neural-success' : 'text-neural-danger'}>{q.options[qr.user_answer] ?? 'No answer'}</span>
                    {!qr.correct && <> · Correct: <span className="text-neural-success">{q.options[qr.correct_answer]}</span></>}
                  </p>
                  {qr.explanation && <p className="text-neural-muted text-xs mt-2 italic">{qr.explanation}</p>}
                </div>
              ) : null
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={resetQuiz} className="btn-secondary flex-1">Try Again</button>
            <button onClick={() => { setQuiz(null); resetQuiz() }} className="btn-primary flex-1">New Quiz</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
