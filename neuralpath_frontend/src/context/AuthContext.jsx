import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const syncProfile = async () => {
    try {
      const data = await api.register()
      setProfile(data)
    } catch {
      try {
        const data = await api.getMe()
        setProfile(data)
      } catch (e) {
        console.warn('Could not fetch profile:', e.message)
      }
    }
  }

  useEffect(() => {
    // On mount: restore session from Supabase (uses sessionStorage internally)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) syncProfile()
      setIsLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) syncProfile()
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signup = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (session) {
      const data = await api.getMe()
      setProfile(data)
      return data
    }
  }

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
