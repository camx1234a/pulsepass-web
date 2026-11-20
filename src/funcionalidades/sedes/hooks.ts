import { useQuery } from '@tanstack/react-query'
import { listarSedesActivas, obtenerSede } from './api'

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: ({ signal }) => listarSedesActivas(signal),
    staleTime: 60_000,
  })
}

export function useSede(code: string) {
  return useQuery({
    queryKey: ['sedes', code],
    queryFn: ({ signal }) => obtenerSede(code, signal),
    enabled: code.length > 0,
  })
}
