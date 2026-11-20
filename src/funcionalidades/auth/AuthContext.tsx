import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { borrarToken, guardarToken, leerSesionToken } from '../../lib/almacenToken'
import { registrarAlNoAutorizado } from '../../lib/http'
import { obtenerUsuarioPorUsername } from '../usuarios/api'
import { login, obtenerYo } from './api'
import { AuthContext, type ContextoAuth } from './contexto'
import type { Sesion, UsuarioAutenticado } from './tipos'

interface AuthProviderProps {
  children: ReactNode
}

/** /me no trae email, así que se completa con /users/by-username (permitido para el propio usuario). */
async function cargarUsuario(): Promise<UsuarioAutenticado> {
  const yo = await obtenerYo()
  const perfil = await obtenerUsuarioPorUsername(yo.username)
  return { userId: yo.userId, username: yo.username, email: perfil.email, roles: yo.roles }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>(() =>
    leerSesionToken() === null ? { estado: 'anonimo' } : { estado: 'cargando' },
  )

  const cerrar = useCallback(
    (motivo?: 'expirada') => {
      borrarToken()
      queryClient.clear()
      setSesion(motivo === undefined ? { estado: 'anonimo' } : { estado: 'anonimo', motivo })
    },
    [queryClient],
  )

  // Cualquier 401 con token enviado cierra la sesión local (FR-FE-AUTH-005).
  useEffect(() => registrarAlNoAutorizado(() => cerrar('expirada')), [cerrar])

  // Restaurar sesión al recargar: el token vigente se valida contra /me.
  useEffect(() => {
    const guardada = leerSesionToken()
    if (guardada === null) return
    let cancelado = false
    cargarUsuario()
      .then((usuario) => {
        if (cancelado) return
        setSesion({ estado: 'autenticado', token: guardada.token, expiraEn: guardada.expiraEn, usuario })
      })
      .catch(() => {
        if (cancelado) return
        borrarToken()
        // Si un 401 ya cerró con motivo 'expirada', se conserva ese estado.
        setSesion((previa) => (previa.estado === 'anonimo' ? previa : { estado: 'anonimo' }))
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Cierre local al vencer el token (15 min, sin refresh).
  const expiraEn = sesion.estado === 'autenticado' ? sesion.expiraEn : null
  useEffect(() => {
    if (expiraEn === null) return
    const id = window.setTimeout(() => cerrar('expirada'), Math.max(0, expiraEn - Date.now()))
    return () => window.clearTimeout(id)
  }, [expiraEn, cerrar])

  const iniciarSesion = useCallback(async (identifier: string, password: string) => {
    const auth = await login({ identifier, password }) // ApiError(401) si son inválidas
    const nuevo = { token: auth.accessToken, expiraEn: Date.now() + auth.expiresIn * 1000 }
    guardarToken(nuevo)
    try {
      const usuario = await cargarUsuario()
      setSesion({ estado: 'autenticado', ...nuevo, usuario })
    } catch (error: unknown) {
      borrarToken()
      throw error
    }
  }, [])

  const valor = useMemo<ContextoAuth>(
    () => ({
      sesion,
      iniciarSesion,
      cerrarSesion: () => cerrar(),
      tieneRol: (...roles) =>
        sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r)),
    }),
    [sesion, iniciarSesion, cerrar],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}