import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/learn', label: 'Learn', icon: '📚' },
  { to: '/codelab', label: 'Code Lab', icon: '⌨' },
  { to: '/games', label: 'Game Zone', icon: '🎮' },
  { to: '/quiz', label: 'Quiz Arena', icon: '⚡' },
  { to: '/simworld', label: 'Sim World', icon: '🔬' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

export default function Navbar() {
  const { profile, logout, session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  if (!session) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neural-surface/90 backdrop-blur-md border-b border-neural-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neural-accent to-neural-purple flex items-center justify-center text-neural-bg font-heading font-bold text-sm">N</div>
          <span className="font-heading font-bold text-neural-text hidden sm:block">NeuralPath</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150
                ${location.pathname.startsWith(link.to)
                  ? 'text-neural-accent bg-neural-accent/10 border border-neural-accent/20'
                  : 'text-neural-muted hover:text-neural-text hover:bg-neural-card/60'
                }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: XP + avatar */}
        <div className="ml-auto flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex items-center gap-2 bg-neural-card border border-neural-border rounded-lg px-3 py-1.5">
              <span className="text-neural-xp text-sm font-bold font-heading">{profile.xp_points}</span>
              <span className="text-neural-muted text-xs">XP</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-neural-muted hover:text-neural-danger border border-neural-border hover:border-neural-danger/40 rounded-lg px-3 py-1.5 transition-all duration-150"
          >
            Logout
          </button>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-neural-muted hover:text-neural-text p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current transition-all" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-neural-surface border-t border-neural-border px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${location.pathname.startsWith(link.to)
                  ? 'text-neural-accent bg-neural-accent/10'
                  : 'text-neural-muted hover:text-neural-text hover:bg-neural-card'
                }`}
            >
              <span>{link.icon}</span>{link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
