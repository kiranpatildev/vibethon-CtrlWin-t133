import { createContext, useContext, useEffect, useState } from 'react'
import { authStore } from '../lib/supabase'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = authStore.getToken()
    const storedUser = authStore.getUser()
    if (token && storedUser) {
      setUser(storedUser)
      // Refresh profile from backend
      api.getMe()
        .then(p => setProfile(p))
        .catch(() => {
          // Token invalid — clear
          authStore.clear()
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    authStore.setToken(data.token)
    const userObj = { id: data.id, email: data.email, display_name: data.display_name }
    authStore.setUser(userObj)
    setUser(userObj)
    setProfile(data)
    return data
  }

  const signup = async (email, password, displayName) => {
    const data = await api.register(email, password, displayName)
    authStore.setToken(data.token)
    const userObj = { id: data.id, email: data.email, display_name: data.display_name }
    authStore.setUser(userObj)
    setUser(userObj)
    setProfile(data)
    return data
  }

  const logout = () => {
    authStore.clear()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (authStore.getToken()) {
      const data = await api.getMe()
      setProfile(data)
      return data
    }
  }

  // session: used by ProtectedRoute — truthy = logged in
  const session = user ? { user, access_token: authStore.getToken() } : null

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
