import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  asociarArtista,
  crearEvento,
  listarEventosPorArtista,
  listarEventosPublicados,
  obtenerEvento,
  publicarEvento,
} from './api'
import type { Evento } from './tipos'

const KEY_CREADOS = ['admin', 'eventos-creados'] as const

function actualizarEventoCreado(
  queryClient: ReturnType<typeof useQueryClient>,
  evento: Evento,
) {
  const actuales = queryClient.getQueryData<Evento[]>(KEY_CREADOS) ?? []
  const otros = actuales.filter((item) => item.eventCode !== evento.eventCode)
  queryClient.setQueryData(KEY_CREADOS, [...otros, evento])
}

export async function invalidarCachePublicacion(
  queryClient: ReturnType<typeof useQueryClient>,
  evento: Evento,
) {
  await Promise.all([
    queryClient.setQueryData(['eventos', evento.eventCode], evento),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
  ])
}

export async function invalidarCacheAsociacion(
  queryClient: ReturnType<typeof useQueryClient>,
  evento: Evento,
) {
  await Promise.all([
    actualizarEventoCreado(queryClient, evento),
    queryClient.setQueryData(['eventos', evento.eventCode], evento),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] }),
    queryClient.invalidateQueries({ queryKey: ['artistas'] }),
  ])
}

export function useEventosCreadosEnSesion() {
  return useQuery<Evento[]>({
    queryKey: KEY_CREADOS,
    queryFn: async () => [],
    initialData: [],
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
    staleTime: 30_000,
  })
}

export function useEventosPorArtista(stageName: string | null) {
  return useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: ({ signal }) => listarEventosPorArtista(stageName ?? '', signal),
    enabled: stageName !== null && stageName.length > 0,
    staleTime: 60_000,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearEvento,
    onSuccess: async (evento) => {
      actualizarEventoCreado(queryClient, evento)
      queryClient.setQueryData(['eventos', evento.eventCode], evento)
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publicarEvento,
    onSuccess: async (evento) => {
      actualizarEventoCreado(queryClient, evento)
      await invalidarCachePublicacion(queryClient, evento)
    },
  })
}

export function useAsociarArtista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventCode,
      artistId,
    }: {
      eventCode: string
      artistId: number
    }) => asociarArtista(eventCode, artistId),
    onSuccess: async (evento) => {
      await invalidarCacheAsociacion(queryClient, evento)
    },
  })
}
