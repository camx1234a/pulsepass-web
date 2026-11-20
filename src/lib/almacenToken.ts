import { z } from 'zod'

// Solo el token y su vencimiento. Nunca localStorage ni cookies; nunca en la URL ni en consola.
const CLAVE = 'pulsepass.token'

const SesionTokenSchema = z.object({ token: z.string().min(1), expiraEn: z.number() })
export type SesionToken = z.infer<typeof SesionTokenSchema>

let enMemoria: SesionToken | null = null

const vigente = (s: SesionToken): boolean => Date.now() < s.expiraEn

export function guardarToken(valor: SesionToken): void {
  enMemoria = valor
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(valor))
  } catch {
    // sessionStorage no disponible: el token queda solo en memoria.
  }
}

export function borrarToken(): void {
  enMemoria = null
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {
    // nada que limpiar
  }
}

/** Devuelve la sesión guardada si es válida (validada con zod) y no ha vencido; si no, la descarta. */
export function leerSesionToken(): SesionToken | null {
  if (enMemoria !== null) {
    if (vigente(enMemoria)) return enMemoria
    borrarToken()
    return null
  }
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    if (crudo === null) return null
    const resultado = SesionTokenSchema.safeParse(JSON.parse(crudo))
    if (resultado.success && vigente(resultado.data)) {
      enMemoria = resultado.data
      return enMemoria
    }
  } catch {
    // JSON inválido o storage inaccesible
  }
  borrarToken()
  return null
}

export const obtenerToken = (): string | null => leerSesionToken()?.token ?? null