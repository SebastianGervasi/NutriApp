import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getPerfil } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) cargarPerfil(session.user.id)
      else setLoading(false)
    })

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await cargarPerfil(session.user.id)
        else { setPerfil(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const cargarPerfil = async (userId) => {
    try {
      const data = await getPerfil(userId)
      setPerfil(data)
    } catch (e) {
      console.error('Error cargando perfil:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, setPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
