import { z } from 'zod'
import { solicitar } from '../../lib/http'
import {
  CrearEventoSchema,
  EventoResumenSchema,
  EventoSchema,
  type CrearEventoForm,
} from './tipos'

export const listarEventosPublicados = (signal?: AbortSignal) =>
  solicitar('/events/published', {
    esquema: z.array(EventoResumenSchema),
    signal,
  })

export const obtenerEvento = (eventCode: string, signal?: AbortSignal) =>
  solicitar(`/events/${encodeURIComponent(eventCode)}`, {
    esquema: EventoSchema,
    signal,
  })

export const listarEventosPorArtista = (
  stageName: string,
  signal?: AbortSignal,
) =>
  solicitar('/events/by-artist', {
    params: { stageName },
    esquema: z.array(EventoResumenSchema),
    signal,
  })

export const crearEvento = (datos: CrearEventoForm) =>
  solicitar('/events', {
    metodo: 'POST',
    cuerpo: CrearEventoSchema.parse(datos),
    esquema: EventoSchema,
  })

export const publicarEvento = (eventCode: string) =>
  solicitar(`/events/${encodeURIComponent(eventCode)}/publish`, {
    metodo: 'PATCH',
    esquema: EventoSchema,
  })

export const asociarArtista = (eventCode: string, artistId: number) =>
  solicitar(`/events/${encodeURIComponent(eventCode)}/artists/${artistId}`, {
    metodo: 'POST',
    esquema: EventoSchema,
  })
