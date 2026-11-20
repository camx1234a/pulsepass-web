import { z } from 'zod'
import { obtenerToken } from './almacenToken'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number // 0 = fallo de red
  readonly details: Record<string, string>

  constructor(
    status: number,
    message: string,
    details: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

// ErrorResponse del backend: { timestamp, status, error, message, details }
const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  details: z.record(z.string(), z.string()).nullish(),
})

const MENSAJE_RED = 'No pudimos conectar con el servidor.'
const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Inténtalo más tarde.'

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Credenciales o sesión inválidas.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontramos lo que buscas.',
  409: 'La operación no se puede completar.',
}

// --- 401 con token enviado = sesión vencida/revocada. AuthProvider se suscribe aquí. ---
let alNoAutorizado: (() => void) | null = null

export function registrarAlNoAutorizado(fn: () => void): () => void {
  alNoAutorizado = fn
  return () => {
    if (alNoAutorizado === fn) alNoAutorizado = null
  }
}

async function construirError(
  respuesta: Response,
  habiaToken: boolean,
): Promise<ApiError> {
  // Un 401 SIN token (p. ej. login incorrecto) no es una sesión expirada.
  if (respuesta.status === 401 && habiaToken) alNoAutorizado?.()

  // 5xx: nunca se muestra el mensaje del servidor.
  if (respuesta.status >= 500)
    return new ApiError(respuesta.status, MENSAJE_INESPERADO)

  const porDefecto = MENSAJES_POR_ESTADO[respuesta.status] ?? MENSAJE_INESPERADO
  try {
    const cuerpo: unknown = JSON.parse(await respuesta.text())
    const valido = ErrorResponseSchema.safeParse(cuerpo)
    if (valido.success) {
      return new ApiError(
        respuesta.status,
        valido.data.message,
        valido.data.details ?? {},
      )
    }
  } catch {
    // cuerpo vacío o no-JSON: se usa el mensaje genérico
  }
  return new ApiError(respuesta.status, porDefecto)
}

interface OpcionesSolicitud<T> {
  esquema: z.ZodType<T>
  metodo?: 'GET' | 'POST' | 'PATCH'
  params?: Record<string, string>
  cuerpo?: unknown
  signal?: AbortSignal
}

export async function solicitar<T>(
  ruta: string,
  opciones: OpcionesSolicitud<T>,
): Promise<T> {
  const { esquema, metodo = 'GET', params, cuerpo, signal } = opciones
  const token = obtenerToken()

  const consulta = params ? `?${new URLSearchParams(params).toString()}` : ''
  const encabezados: Record<string, string> = { Accept: 'application/json' }
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json'
  if (token !== null) encabezados['Authorization'] = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}${consulta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal,
    })
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new ApiError(0, MENSAJE_RED)
  }

  if (!respuesta.ok) throw await construirError(respuesta, token !== null)

  let json: unknown
  try {
    json = await respuesta.json()
  } catch {
    throw new ApiError(500, MENSAJE_INESPERADO)
  }
  const valido = esquema.safeParse(json)
  if (!valido.success) throw new ApiError(500, MENSAJE_INESPERADO) // contrato roto: no mostrar detalles
  return valido.data
}
