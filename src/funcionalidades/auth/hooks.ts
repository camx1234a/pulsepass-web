import { useContext } from 'react'
import { AuthContext, type ContextoAuth } from './contexto'

export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContext)
  if (contexto === null) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}