import { z } from 'zod'
import { solicitar } from '../../lib/http'
import { EventoResumenSchema } from './tipos'

export const listarEventosPublicados = (signal?: AbortSignal) =>
  solicitar('/events/published', { esquema: z.array(EventoResumenSchema), signal })