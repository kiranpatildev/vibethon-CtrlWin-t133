import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

export default function Lesson() {
  const { moduleSlug } = useParams()
  const navigate = useNavigate()
  const [module, setModule] = useState(null)
  const [activeLesson, setActiveLesson] = useState(0)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    api.getModule(moduleSlug)
      .then(data => { setModule(data); setLoading(false) })
      .catch(() => { toast.error('Module not found'); navigate('/learn') })
    api.getProgress().then(prog => {
      const p = prog.find(p => p.module_slug === moduleSlug)
      setProgress(p)
    }).catch(() => {})
  }, [moduleSlug])

  const currentLesson = module?.lessons?.[activeLesson]
  const isCompleted = (id) => progress?.lessons_completed?.includes(String(id))

  const handleCompleteLesson = async () => {
    if (!currentLesson || completing) return
    setCompleting(true)
    try {
      const updated = await api.markProgress(moduleSlug, String(currentLesson.id))
      setProgress(updated)
      toast.success('+10 XP! Lesson complete 🎯')
      // Auto advance
      if (activeLesson < module.lessons.length - 1) {
        setTimeout(() => setActiveLesson(a => a + 1), 800)
      }
    } catch (e) { toast.error(e.message) }
    finally { setCompleting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neural-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neural-muted mb-6">
        <Link to="/learn" className="hover:text-neural-accent transition-colors">Learn</Link>
        <span>/</span>
        <span className="text-neural-text">{module?.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: lesson list */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="font-heading font-semibold text-neural-text text-sm mb-1">{module?.title}</div>
            <div className="text-neural-muted text-xs mb-4">⏱ {module?.estimated_minutes} min · +{module?.xp_reward} XP</div>
            <div className="space-y-1">
              {module?.lessons.map((lesson, i) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2
                    ${activeLesson === i ? 'bg-neural-accent/10 text-neural-accent border border-neural-accent/20' : 'text-neural-muted hover:text-neural-text hover:bg-neural-card/60'}`}
                >
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs flex-shrink-0
                    ${isCompleted(lesson.id) ? 'bg-neural-success/20 border-neural-success/40 text-neural-success' : 'border-neural-border'}`}>
                    {isCompleted(lesson.id) ? '✓' : i + 1}
                  </span>
                  <span className="line-clamp-2">{lesson.title}</span>
                  {lesson.has_code_challenge && <span className="text-xs ml-auto">⌨</span>}
                </button>
              ))}
            </div>

            {/* Quiz link */}
            <div className="mt-4 pt-4 border-t border-neural-border">
              <Link to={`/quiz/${moduleSlug}`} className="btn-secondary w-full text-center text-sm block">
                Take Module Quiz ⚡
              </Link>
            </div>
          </div>
        </div>

        {/* Main lesson content */}
        <div className="lg:col-span-3">
          {currentLesson && (
            <motion.div key={currentLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card mb-4">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="badge-accent text-xs mb-2">Lesson {activeLesson + 1} of {module.lessons.length}</div>
                    <h2 className="font-heading text-2xl font-bold text-neural-text">{currentLesson.title}</h2>
                  </div>
                  {isCompleted(currentLesson.id) && <span className="badge-success">Complete ✓</span>}
                </div>

                <div className="prose-neural">
                  <ReactMarkdown>{currentLesson.content_markdown}</ReactMarkdown>
                </div>
              </div>

              {/* Code challenge */}
              {currentLesson.has_code_challenge && (
                <div className="card mb-4 border-neural-accent/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">⌨</span>
                    <div>
                      <h3 className="font-heading font-semibold text-neural-text">Code Challenge</h3>
                      <p className="text-neural-muted text-xs">Try this in Code Lab with AI hints</p>
                    </div>
                  </div>
                  <pre className="bg-neural-surface border border-neural-border rounded-xl p-4 text-sm font-mono text-neural-text overflow-x-auto">
                    {currentLesson.starter_code}
                  </pre>
                  <Link to="/codelab" className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
                    Open in Code Lab ⌨
                  </Link>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveLesson(a => Math.max(0, a - 1))}
                  disabled={activeLesson === 0}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing || isCompleted(currentLesson.id)}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {completing ? <span className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" /> : null}
                  {isCompleted(currentLesson.id) ? '✓ Completed' : activeLesson === module.lessons.length - 1 ? 'Complete Module ✓' : 'Mark Complete & Continue →'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
