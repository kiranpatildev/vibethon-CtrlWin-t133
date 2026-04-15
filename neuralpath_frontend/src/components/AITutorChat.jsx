import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const QUICK_PROMPTS = [
  "What's the difference between overfitting and underfitting?",
  'Explain gradient descent in simple terms',
  'What is the attention mechanism?',
  'What are precision and recall?',
]

export default function AITutorChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI tutor powered by Gemini. Ask me anything about AI or machine learning!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const location = useLocation()

  // Extract topic context from current page URL
  const topicContext = location.pathname

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const data = await api.askTutor(userMsg, topicContext)
      setMessages(m => [...m, { role: 'assistant', text: data.answer }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: `Sorry, I encountered an error: ${e.message}. Make sure GEMINI_API_KEY is set in the backend .env file.` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        id="ai-tutor-toggle"
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-neural-accent to-neural-purple flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all glow-accent"
        title="Ask AI Tutor"
      >
        <span className="text-2xl">{open ? '✕' : '🤖'}</span>
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-neural-border bg-neural-surface shadow-2xl overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neural-border bg-gradient-to-r from-neural-accent/10 to-neural-purple/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neural-accent to-neural-purple flex items-center justify-center text-sm">🤖</div>
              <div>
                <div className="font-heading font-semibold text-neural-text text-sm">AI Tutor</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-neural-success rounded-full animate-pulse" />
                  <span className="text-neural-muted text-xs">Powered by Gemini</span>
                </div>
              </div>
              <button onClick={() => setMessages([{ role: 'assistant', text: "Hi! I'm your AI tutor. Ask me anything!" }])}
                className="ml-auto text-neural-muted hover:text-neural-text text-xs transition-colors">Clear</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-neural-accent text-neural-bg font-medium'
                      : 'bg-neural-card border border-neural-border text-neural-text'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neural-card border border-neural-border rounded-2xl px-4 py-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-neural-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neural-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neural-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-neural-accent/30 bg-neural-accent/5 text-neural-accent hover:bg-neural-accent/15 transition-all whitespace-nowrap">
                    {q.length > 35 ? q.slice(0, 35) + '…' : q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-neural-border flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about AI/ML..."
                rows={1}
                className="flex-1 bg-neural-surface border border-neural-border rounded-xl px-3 py-2 text-sm text-neural-text placeholder:text-neural-muted focus:outline-none focus:border-neural-accent/60 resize-none"
                style={{ minHeight: '40px', maxHeight: '100px' }}
              />
              <button
                id="ai-send"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="btn-primary px-3 py-2 text-sm flex-shrink-0 disabled:opacity-40"
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
