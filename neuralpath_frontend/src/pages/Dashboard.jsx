import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const BADGE_META = {
  first_lesson: { icon: '🎯', label: 'First Lesson', desc: 'Completed your first lesson' },
  quiz_master: { icon: '⚡', label: 'Quiz Master', desc: '100% on any quiz' },
  code_runner: { icon: '⌨', label: 'Code Runner', desc: 'Ran Python in Code Lab' },
  week_streak: { icon: '🔥', label: 'Week Streak', desc: '7-day learning streak' },
  game_player: { icon: '🎮', label: 'Game Player', desc: 'Played all 3 mini-games' },
  sim_scientist: { icon: '🔬', label: 'Sim Scientist', desc: 'Built a model in Sim World' },
}

const SKILL_AXES = [
  { subject: 'NLP', key: 'nlp' },
  { subject: 'Computer Vision', key: 'computer_vision' },
  { subject: 'Tabular', key: 'tabular' },
  { subject: 'RL', key: 'reinforcement_learning' },
  { subject: 'Evaluation', key: 'model_evaluation' },
  { subject: 'Preprocessing', key: 'data_preprocessing' },
]

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const [progress, setProgress] = useState([])
  const [radarData, setRadarData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await refreshProfile()
        const prog = await api.getProgress()
        setProgress(prog)

        // Build radar scores from progress
        const skillScores = {}
        SKILL_AXES.forEach(a => { skillScores[a.key] = 0 })
        prog.forEach(p => {
          if (p.completed && skillScores[p.skill_category] !== undefined) {
            skillScores[p.skill_category] = Math.min(100, skillScores[p.skill_category] + 40)
          }
        })
        setRadarData(SKILL_AXES.map(a => ({ subject: a.subject, score: skillScores[a.key] || 0, fullMark: 100 })))
      } catch (e) {
        console.error(e)
        setRadarData(SKILL_AXES.map(a => ({ subject: a.subject, score: 0, fullMark: 100 })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const level = profile?.level || { name: 'Novice', number: 1, next_xp: 200 }
  const xp = profile?.xp_points || 0
  const xpProgress = level.next_xp ? Math.min(100, (xp / level.next_xp) * 100) : 100
  const completedCount = progress.filter(p => p.completed).length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neural-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neural-text">
          Welcome back, <span className="gradient-text">{profile?.display_name || 'Learner'}</span> 👋
        </h1>
        <p className="text-neural-muted mt-1">Keep the momentum going — you're on a {profile?.streak_count || 0}-day streak!</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'XP Points', value: xp, icon: '⚡', color: 'text-neural-xp' },
          { label: 'Day Streak', value: `${profile?.streak_count || 0}🔥`, icon: '🔥', color: 'text-orange-400' },
          { label: 'Modules Done', value: completedCount, icon: '✅', color: 'text-neural-success' },
          { label: 'Level', value: level.name, icon: '🎖', color: 'text-neural-accent' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className={`font-heading font-bold text-2xl ${stat.color}`}>{stat.value}</div>
            <div className="text-neural-muted text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* XP Progress */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Level {level.number} — {level.name}</div>
              <div className="section-subtitle">{level.next_xp ? `${xp} / ${level.next_xp} XP to next level` : 'Max level reached!'}</div>
            </div>
            <div className="badge-xp">{level.number >= 5 ? '👑 MAX' : `Lvl ${level.number}`}</div>
          </div>
          <div className="progress-bar h-3 mb-6">
            <motion.div
              className="progress-fill h-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { to: '/learn', label: 'Continue Learning', icon: '📚' },
              { to: '/quiz', label: 'Take a Quiz', icon: '⚡' },
              { to: '/codelab', label: 'Open Code Lab', icon: '⌨' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center gap-2 p-3 bg-neural-surface border border-neural-border rounded-lg hover:border-neural-accent/40 transition-all text-sm font-medium text-neural-text">
                <span>{a.icon}</span>{a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Skill Radar */}
        <div className="card">
          <div className="section-title mb-1">Skill Coverage</div>
          <div className="section-subtitle mb-4">Complete modules to fill the radar</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2A3A5C" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Radar name="Skills" dataKey="score" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: '#1A2235', border: '1px solid #2A3A5C', borderRadius: 8 }}
                labelStyle={{ color: '#E2E8F0' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges */}
      <div className="card mb-8">
        <div className="section-title mb-4">Achievements</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {Object.entries(BADGE_META).map(([id, meta]) => {
            const unlocked = profile?.badges?.includes(id)
            return (
              <div key={id} title={meta.desc} className={`text-center p-3 rounded-xl border transition-all cursor-default ${unlocked ? 'border-neural-accent/30 bg-neural-accent/5' : 'border-neural-border/50 opacity-40'}`}>
                <div className="text-2xl mb-1">{meta.icon}</div>
                <div className="text-xs text-neural-muted font-medium">{meta.label}</div>
                {unlocked && <div className="badge-accent text-[10px] mt-1">Unlocked</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Progress */}
      {progress.length > 0 && (
        <div className="card">
          <div className="section-title mb-4">Recent Progress</div>
          <div className="space-y-3">
            {progress.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="text-neural-text text-sm font-medium">{p.module_title}</div>
                  <div className="text-neural-muted text-xs">{p.lessons_completed?.length || 0} lessons completed</div>
                </div>
                {p.completed
                  ? <span className="badge-success">Complete ✓</span>
                  : <span className="badge-accent">In Progress</span>
                }
              </div>
            ))}
          </div>
          <Link to="/learn" className="btn-ghost text-sm mt-4 inline-block">View all modules →</Link>
        </div>
      )}
    </div>
  )
}
