import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginForm = z.infer<typeof LoginSchema>

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

// OJO: /api/auth/me devuelve SOLO { userId, username, roles }; NO trae email.
// Los roles llegan sin prefijo ROLE_ y ordenados.
export const AuthenticatedUserSchema = z.object({
  userId: z.number(),
  username: z.string(),
  roles: z.array(RolSchema),
})
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>

// Usuario de sesión = /me + email obtenido con GET /api/users/by-username
export interface UsuarioAutenticado {
  userId: number
  username: string
  email: string
  roles: Rol[]
}

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; motivo?: 'expirada' } // RutaProtegida lo pasa a /login como state.motivo
  | {
      estado: 'autenticado'
      token: string
      expiraEn: number
      usuario: UsuarioAutenticado
    }
