import { solicitar } from '../../lib/http'
import {
  AuthenticatedUserSchema,
  AuthResponseSchema,
  type LoginForm,
} from './tipos'

export const login = (datos: LoginForm) =>
  solicitar('/auth/login', {
    metodo: 'POST',
    cuerpo: datos,
    esquema: AuthResponseSchema,
  })

export const obtenerYo = (signal?: AbortSignal) =>
  solicitar('/auth/me', { esquema: AuthenticatedUserSchema, signal })
