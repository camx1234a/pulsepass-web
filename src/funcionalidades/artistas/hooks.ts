import { useQuery } from '@tanstack/react-query'
import { listarArtistasActivos, obtenerArtista, obtenerArtistaPorNombre } from './api'

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: ({ signal }) => listarArtistasActivos(signal),
    staleTime: 60_000,
  })
}

export function useArtista(id: number) {
  return useQuery({
    queryKey: ['artistas', id],
    queryFn: ({ signal }) => obtenerArtista(id, signal),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useArtistaPorNombre(stageName: string) {
  return useQuery({
    queryKey: ['artistas', 'nombre', stageName],
    queryFn: ({ signal }) => obtenerArtistaPorNombre(stageName, signal),
    enabled: stageName.length > 0,
  })
}
