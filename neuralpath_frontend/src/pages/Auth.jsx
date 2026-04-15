import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        if (!displayName.trim()) { toast.error('Display name is required'); setLoading(false); return }
        await signup(email, password, displayName)
        toast.success('Account created! Welcome to NeuralPath 🎉')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neural-bg neural-bg-pattern flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neural-accent to-neural-purple flex items-center justify-center text-neural-bg font-heading font-bold">N</div>
            <span className="font-heading font-bold text-xl text-neural-text">NeuralPath</span>
          </Link>
          <p className="text-neural-muted text-sm">Your AI/ML learning journey starts here</p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div className="flex bg-neural-surface rounded-lg p-1 mb-6">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-neural-accent text-neural-bg' : 'text-neural-muted hover:text-neural-text'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-sm text-neural-muted mb-1.5">Display Name</label>
                <input
                  id="display-name"
                  className="input"
                  placeholder="e.g. Alex Chen"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-neural-muted mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-neural-muted mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button id="auth-submit" type="submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                tab === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>


          <p className="text-center text-neural-muted text-xs mt-4">
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} className="text-neural-accent hover:underline">
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
