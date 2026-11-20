import { solicitar } from '../../lib/http'
import { UsuarioSchema, type RegistroForm } from './tipos'

/** Solo permitido para el propio usuario (el backend responde 403 si no). */
export const obtenerUsuarioPorUsername = (username: string, signal?: AbortSignal) =>
  solicitar('/users/by-username', { params: { username }, esquema: UsuarioSchema, signal })

export const obtenerUsuarioPorEmail = (email: string, signal?: AbortSignal) =>
  solicitar('/users/by-email', { params: { email }, esquema: UsuarioSchema, signal })

export function registrarUsuario(datos: RegistroForm) {
  const { phone, city, ...obligatorios } = datos
  return solicitar('/users', {
    metodo: 'POST',
    esquema: UsuarioSchema,
    cuerpo: {
      ...obligatorios,
      ...(phone ? { phone } : {}),
      ...(city ? { city } : {}),
    },
  })
}