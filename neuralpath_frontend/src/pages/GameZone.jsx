import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TrainTheNeuron from '../components/games/TrainTheNeuron'
import SortTheData from '../components/games/SortTheData'
import GradientSurfer from '../components/games/GradientSurfer'

const GAMES = [
  {
    id: 'neuron',
    title: 'Train the Neuron',
    icon: '🧠',
    concept: 'Weights · Activation Functions · Accuracy',
    desc: 'Adjust weights and bias to classify toy data. Discover how activation functions change the output.',
    badge: 'purple',
    component: TrainTheNeuron,
  },
  {
    id: 'sort',
    title: 'Sort the Data',
    icon: '📊',
    concept: 'Classification · Decision Making',
    desc: 'Drag cards to the correct category. How accurate can you be at classifying spam vs not spam?',
    badge: 'accent',
    component: SortTheData,
  },
  {
    id: 'gradient',
    title: 'Gradient Descent Surfer',
    icon: '🏄',
    concept: 'Loss Function · Learning Rate · Optimization',
    desc: 'Watch a ball roll down a loss curve. See how learning rate affects convergence.',
    badge: 'xp',
    component: GradientSurfer,
  },
]

export default function GameZone() {
  const [activeGame, setActiveGame] = useState(null)

  const ActiveComponent = activeGame ? GAMES.find(g => g.id === activeGame)?.component : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neural-text">Game Zone</h1>
        <p className="text-neural-muted mt-1">Learn ML concepts through play. Each game teaches a core idea.</p>
      </div>

      {/* Game selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`card-hover text-left group transition-all ${activeGame === game.id ? 'border-neural-accent/60 bg-neural-accent/5' : ''}`}
          >
            <div className="text-4xl mb-3">{game.icon}</div>
            <h3 className="font-heading font-semibold text-neural-text mb-1 group-hover:text-neural-accent transition-colors">{game.title}</h3>
            <p className="text-xs text-neural-muted mb-3 leading-relaxed">{game.desc}</p>
            <div className={`badge badge-${game.badge} text-[10px]`}>{game.concept}</div>
          </button>
        ))}
      </div>

      {/* Active game */}
      <AnimatePresence mode="wait">
        {ActiveComponent && (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-neural-text">
                {GAMES.find(g => g.id === activeGame)?.title}
              </h2>
              <button onClick={() => setActiveGame(null)} className="btn-ghost text-sm">✕ Close</button>
            </div>
            <ActiveComponent />
          </motion.div>
        )}
      </AnimatePresence>

      {!activeGame && (
        <div className="card border-dashed border-neural-border/60 text-center py-12">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-neural-muted">Select a game above to start playing</p>
          <p className="text-neural-muted text-sm mt-1">Each game earns you +15 XP</p>
        </div>
      )}
    </div>
  )
}
