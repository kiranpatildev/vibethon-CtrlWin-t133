import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { motion } from 'framer-motion'

const TRACK_COLORS = {
  beginner: 'text-neural-success border-neural-success/30 bg-neural-success/10',
  practitioner: 'text-neural-accent border-neural-accent/30 bg-neural-accent/10',
  advanced: 'text-neural-purple border-neural-purple/30 bg-neural-purple/10',
}

export default function Learn() {
  const [tracks, setTracks] = useState([])
  const [progress, setProgress] = useState({})
  const [activeTrack, setActiveTrack] = useState('beginner')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [tracksData, progressData] = await Promise.all([api.getTracks(), api.getProgress()])
        setTracks(tracksData)
        const progressMap = {}
        progressData.forEach(p => { progressMap[p.module_slug] = p })
        setProgress(progressMap)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const currentTrack = tracks.find(t => t.track_level === activeTrack)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neural-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neural-text">Learning Tracks</h1>
        <p className="text-neural-muted mt-1">Choose your level and start building your AIML skills</p>
      </div>

      {/* Track selector tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tracks.map(track => (
          <button
            key={track.track_level}
            onClick={() => setActiveTrack(track.track_level)}
            className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 font-heading capitalize
              ${activeTrack === track.track_level
                ? TRACK_COLORS[track.track_level]
                : 'text-neural-muted border-neural-border hover:border-neural-border/80 hover:text-neural-text'
              }`}
          >
            {track.track_level === 'beginner' ? '🚀' : track.track_level === 'practitioner' ? '🧠' : '⚡'} {track.name}
          </button>
        ))}
      </div>

      {/* Track description */}
      {currentTrack && (
        <div className="card mb-6 border-neural-accent/20">
          <p className="text-neural-muted text-sm leading-relaxed">{currentTrack.description}</p>
        </div>
      )}

      {/* Module cards */}
      <div className="space-y-4">
        {currentTrack?.modules.map((module, i) => {
          const prog = progress[module.slug]
          const isComplete = prog?.completed
          const lessonsCompleted = prog?.lessons_completed?.length || 0
          const totalLessons = module.lesson_count || 3

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/learn/${module.slug}`} className="block card-hover group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-heading font-bold flex-shrink-0
                      ${isComplete ? 'bg-neural-success/20 text-neural-success border border-neural-success/30' : 'bg-neural-surface border border-neural-border text-neural-muted'}`}>
                      {isComplete ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-neural-text group-hover:text-neural-accent transition-colors">{module.title}</h3>
                      <p className="text-neural-muted text-sm mt-1 leading-relaxed line-clamp-2">{module.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-neural-muted text-xs">⏱ {module.estimated_minutes} min</span>
                        <span className="text-neural-xp text-xs font-semibold">+{module.xp_reward} XP</span>
                        <span className="text-neural-muted text-xs capitalize">{module.skill_category?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {isComplete
                      ? <span className="badge-success text-xs">Complete</span>
                      : lessonsCompleted > 0
                        ? <span className="badge-accent text-xs">In Progress</span>
                        : <span className="text-neural-muted text-xs">Not started</span>
                    }
                    <span className="text-neural-muted text-xs mt-1 group-hover:text-neural-accent transition-colors">Start →</span>
                  </div>
                </div>

                {/* Progress bar */}
                {lessonsCompleted > 0 && !isComplete && (
                  <div className="mt-4 progress-bar h-1.5">
                    <div className="progress-fill h-full" style={{ width: `${(lessonsCompleted / totalLessons) * 100}%` }} />
                  </div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
