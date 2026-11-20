import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asociarArtista, crearEvento, listarEventosPorArtista, listarEventosPublicados, obtenerEvento, publicarEvento } from './api'
import type { Evento } from './tipos'

const KEY_CREADOS = ['admin', 'eventos-creados'] as const
const eventosCreados = new Map<string, Evento>()

function actualizarEventosCreados(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.setQueryData(KEY_CREADOS, Array.from(eventosCreados.values()))
}

export function useEventosCreadosEnSesion() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: KEY_CREADOS,
    queryFn: async () => Array.from(eventosCreados.values()),
    initialData: () => queryClient.getQueryData<Evento[]>(KEY_CREADOS) ?? [],
    staleTime: Infinity,
  })
}

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

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearEvento,
    onSuccess: async (evento) => {
      eventosCreados.set(evento.eventCode, evento)
      actualizarEventosCreados(queryClient)
      queryClient.setQueryData(['eventos', evento.eventCode], evento)
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publicarEvento,
    onSuccess: async (evento) => {
      eventosCreados.set(evento.eventCode, evento)
      actualizarEventosCreados(queryClient)
      await Promise.all([
        queryClient.setQueryData(['eventos', evento.eventCode], evento),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
      ])
    },
  })
}

export function useAsociarArtista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventCode, artistId }: { eventCode: string; artistId: number }) => asociarArtista(eventCode, artistId),
    onSuccess: async (evento) => {
      eventosCreados.set(evento.eventCode, evento)
      actualizarEventosCreados(queryClient)
      queryClient.setQueryData(['eventos', evento.eventCode], evento)
    },
  })
}
