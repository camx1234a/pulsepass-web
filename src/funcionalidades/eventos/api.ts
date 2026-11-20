import { z } from 'zod'
import { solicitar } from '../../lib/http'
import { EventoResumenSchema, EventoSchema } from './tipos'

export const listarEventosPublicados = (signal?: AbortSignal) =>
  solicitar('/events/published', { esquema: z.array(EventoResumenSchema), signal })

export const obtenerEvento = (eventCode: string, signal?: AbortSignal) =>
  solicitar(`/events/${encodeURIComponent(eventCode)}`, { esquema: EventoSchema, signal })

export const listarEventosPorArtista = (stageName: string, signal?: AbortSignal) =>
  solicitar('/events/by-artist', {
    params: { stageName },
    esquema: z.array(EventoResumenSchema),
    signal,
  })