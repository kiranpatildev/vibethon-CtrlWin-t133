import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [board, me] = await Promise.all([api.getLeaderboard(20), api.getMyRank()])
      setEntries(board)
      setMyRank(me)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()
    // Supabase Realtime for live leaderboard
    const channel = supabase.channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_entry' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const MEDALS = ['🥇', '🥈', '🥉']

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neural-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neural-text">Leaderboard</h1>
        <p className="text-neural-muted mt-1">Top learners by XP · Updates in real time</p>
      </div>

      {/* My rank */}
      {myRank?.rank && (
        <div className="card border-neural-accent/30 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-neural-muted mb-0.5">Your rank</div>
            <div className="font-heading font-bold text-neural-accent text-2xl">#{myRank.rank}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neural-muted mb-0.5">XP</div>
            <div className="xp-text text-xl">{myRank.xp_points}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neural-muted mb-0.5">Streak</div>
            <div className="text-orange-400 font-bold">{myRank.streak_count}🔥</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neural-muted mb-0.5">Modules</div>
            <div className="text-neural-success font-bold">{myRank.modules_completed}</div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {entries.slice(0, 3).map((entry, i) => (
          <div key={entry.rank} className={`card text-center ${i === 0 ? 'border-yellow-500/40 bg-yellow-500/5' : ''}`}>
            <div className="text-3xl mb-2">{MEDALS[i]}</div>
            <div className="font-heading font-semibold text-neural-text text-sm truncate">{entry.display_name || `User ${entry.rank}`}</div>
            <div className="xp-text text-lg mt-1">{entry.xp_points}</div>
            <div className="text-neural-muted text-xs">XP</div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-neural-border flex items-center justify-between">
          <span className="text-sm font-heading font-semibold text-neural-text">All Rankings</span>
          <div className="flex items-center gap-2 text-xs text-neural-success">
            <span className="w-2 h-2 bg-neural-success rounded-full animate-pulse" />
            Live
          </div>
        </div>
        <div className="divide-y divide-neural-border/50">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-neural-surface/50 transition-colors
                ${myRank?.rank === entry.rank ? 'bg-neural-accent/5 border-l-2 border-l-neural-accent' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0
                ${i < 3 ? 'bg-neural-xp/20 text-neural-xp' : 'bg-neural-surface text-neural-muted'}`}>
                {i < 3 ? MEDALS[i] : entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-neural-text font-medium text-sm truncate">{entry.display_name || 'Anonymous Learner'}</div>
                <div className="text-neural-muted text-xs">{entry.modules_completed} modules · {entry.streak_count}🔥 streak</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex gap-1">
                  {entry.badges?.slice(0, 3).map(b => (
                    <span key={b} className="text-sm" title={b}>{b === 'quiz_master' ? '⚡' : b === 'week_streak' ? '🔥' : b === 'first_lesson' ? '🎯' : '🏅'}</span>
                  ))}
                </div>
                <div className="xp-text text-sm font-bold tabular-nums">{entry.xp_points} XP</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
