import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '📚', title: 'Structured Curriculum', desc: '6 modules from Beginner to Advanced with real AIML content' },
  { icon: '⌨', title: 'In-Browser Code Lab', desc: 'Run Python instantly via Pyodide — no setup required' },
  { icon: '🎮', title: 'Mini-Games', desc: '3 interactive games that teach weights, classification & gradient descent' },
  { icon: '⚡', title: 'AI-Powered Quizzes', desc: 'Gemini generates adaptive quizzes on demand for any topic' },
  { icon: '🔬', title: 'Sim World', desc: 'Explore real datasets and train ML models directly in your browser' },
  { icon: '🤖', title: 'AI Tutor', desc: 'Ask any AIML question — get instant expert answers via Gemini' },
]

const STATS = [
  { value: '6', label: 'Learning Modules' },
  { value: '18', label: 'Hands-on Lessons' },
  { value: '3', label: 'Real Datasets' },
  { value: '4', label: 'AI Integrations' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-neural-bg neural-bg-pattern font-body">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neural-surface/80 backdrop-blur-md border-b border-neural-border px-6 flex items-center h-16">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neural-accent to-neural-purple flex items-center justify-center text-neural-bg font-heading font-bold text-sm">N</div>
            <span className="font-heading font-bold text-neural-text text-lg">NeuralPath</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-neural-muted hover:text-neural-text text-sm font-medium transition-colors">Sign in</Link>
            <Link to="/auth" className="btn-primary text-sm">Get Started Free →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="badge-accent mb-6 inline-flex">🚀 Learn AI/ML interactively</div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-neural-text leading-tight mb-6">
              Master{' '}
              <span className="bg-gradient-to-r from-neural-accent to-neural-purple bg-clip-text text-transparent">
                AI & Machine Learning
              </span>
              <br />the right way
            </h1>
            <p className="text-neural-muted text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed">
              From zero to practitioner — structured curriculum, in-browser Python, mini-games, 
              real datasets, and an AI tutor that never sleeps.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/auth" className="btn-primary text-base px-8 py-3 glow-accent">
                Start Learning Free →
              </Link>
              <Link to="/auth" className="btn-secondary text-base px-8 py-3">
                Watch Demo
              </Link>
            </div>
          </motion.div>

          {/* Floating stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-6 mt-16 flex-wrap"
          >
            {STATS.map((s) => (
              <div key={s.label} className="card text-center min-w-[100px]">
                <div className="xp-text text-3xl">{s.value}</div>
                <div className="text-neural-muted text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-neural-text mb-4">Everything you need to learn AIML</h2>
            <p className="text-neural-muted text-lg">Not another boring tutorial. This is learning reimagined.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-hover group cursor-default"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-semibold text-neural-text text-lg mb-2">{f.title}</h3>
                <p className="text-neural-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center card border-neural-accent/30 glow-accent">
          <h2 className="font-heading text-3xl font-bold text-neural-text mb-4">Ready to become an AI practitioner?</h2>
          <p className="text-neural-muted mb-8">Join NeuralPath and start your journey today — completely free.</p>
          <Link to="/auth" className="btn-primary text-base px-10 py-3">Create Free Account →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neural-border py-8 px-6 text-center text-neural-muted text-sm">
        <p>Built with ❤️ for the hackathon · NeuralPath 2026</p>
      </footer>
    </div>
  )
}
