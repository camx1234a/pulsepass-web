import { z } from 'zod'
import { solicitar } from '../../lib/http'
import { ArtistaSchema } from './tipos'

export const listarArtistasActivos = (signal?: AbortSignal) =>
  solicitar('/artists/active', { esquema: z.array(ArtistaSchema), signal })

export const obtenerArtista = (id: number, signal?: AbortSignal) =>
  solicitar(`/artists/${id}`, { esquema: ArtistaSchema, signal })

export const obtenerArtistaPorNombre = (
  stageName: string,
  signal?: AbortSignal,
) =>
  solicitar('/artists/by-stage-name', {
    params: { stageName },
    esquema: ArtistaSchema,
    signal,
  })
