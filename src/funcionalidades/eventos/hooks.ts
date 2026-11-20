import { useQuery } from '@tanstack/react-query'
import { listarEventosPorArtista, listarEventosPublicados, obtenerEvento } from './api'

export function useEventosPublicados() {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: ({ signal }) => listarEventosPublicados(signal),
    staleTime: 60_000,
  })
}

export function useEvento(eventCode: string) {
  return useQuery({
    queryKey: ['eventos', eventCode],
    queryFn: ({ signal }) => obtenerEvento(eventCode, signal),
    enabled: eventCode.length > 0,
  })
}

export function useEventosPorArtista(stageName: string | null) {
  return useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: ({ signal }) => listarEventosPorArtista(stageName ?? '', signal),
    enabled: stageName !== null && stageName.length > 0,
  })
}
