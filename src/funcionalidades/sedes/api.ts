import { z } from 'zod'
import { solicitar } from '../../lib/http'
import { SedeSchema } from './tipos'

export const listarSedesActivas = (signal?: AbortSignal) =>
  solicitar('/venues/active', { esquema: z.array(SedeSchema), signal })

export const obtenerSede = (code: string, signal?: AbortSignal) =>
  solicitar(`/venues/${encodeURIComponent(code)}`, { esquema: SedeSchema, signal })
