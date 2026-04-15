import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Lesson from './pages/Lesson'
import CodeLab from './pages/CodeLab'
import GameZone from './pages/GameZone'
import QuizArena from './pages/QuizArena'
import SimWorld from './pages/SimWorld'
import Leaderboard from './pages/Leaderboard'
import AITutorChat from './components/AITutorChat'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-neural-bg">
      <Navbar />
      <main className="pt-16">{children}</main>
      <AITutorChat />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A2235', color: '#E2E8F0', border: '1px solid #2A3A5C' },
            success: { iconTheme: { primary: '#22C55E', secondary: '#0A0F1E' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#0A0F1E' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected — all wrapped in AppLayout with Navbar + AI chat */}
          <Route path="/dashboard" element={
            <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="/learn" element={
            <ProtectedRoute><AppLayout><Learn /></AppLayout></ProtectedRoute>
          } />
          <Route path="/learn/:moduleSlug" element={
            <ProtectedRoute><AppLayout><Lesson /></AppLayout></ProtectedRoute>
          } />
          <Route path="/codelab" element={
            <ProtectedRoute><AppLayout><CodeLab /></AppLayout></ProtectedRoute>
          } />
          <Route path="/games" element={
            <ProtectedRoute><AppLayout><GameZone /></AppLayout></ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute><AppLayout><QuizArena /></AppLayout></ProtectedRoute>
          } />
          <Route path="/quiz/:moduleSlug" element={
            <ProtectedRoute><AppLayout><QuizArena /></AppLayout></ProtectedRoute>
          } />
          <Route path="/simworld" element={
            <ProtectedRoute><AppLayout><SimWorld /></AppLayout></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
