import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelarTicket,
  comprarTicket,
  listarTicketsPagados,
  listarTicketsPorUsuario,
  obtenerTicket,
  usarTicket,
} from './api'
import type { Ticket } from './tipos'

export async function invalidarCacheCompra(
  queryClient: ReturnType<typeof useQueryClient>,
  email: string,
  ticket: Ticket,
) {
  await Promise.all([
    queryClient.setQueryData(['ticket', ticket.ticketCode], ticket),
    queryClient.invalidateQueries({ queryKey: ['tickets', email] }),
    queryClient.invalidateQueries({
      queryKey: ['tickets', 'pagados', ticket.eventCode],
    }),
    queryClient.invalidateQueries({ queryKey: ['eventos', ticket.eventCode] }),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] }),
  ])
}

export async function invalidarCacheCancelacion(
  queryClient: ReturnType<typeof useQueryClient>,
  email: string,
  ticket: Ticket,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['tickets', email] }),
    queryClient.setQueryData(['ticket', ticket.ticketCode], ticket),
    queryClient.invalidateQueries({
      queryKey: ['tickets', 'pagados', ticket.eventCode],
    }),
    queryClient.invalidateQueries({ queryKey: ['eventos', ticket.eventCode] }),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
    queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] }),
  ])
}

export async function invalidarCacheUso(
  queryClient: ReturnType<typeof useQueryClient>,
  ticket: Ticket,
) {
  await Promise.all([
    queryClient.setQueryData(['ticket', ticket.ticketCode], ticket),
    queryClient.invalidateQueries({
      queryKey: ['tickets', 'pagados', ticket.eventCode],
    }),
    queryClient.invalidateQueries({ queryKey: ['tickets', ticket.userEmail] }),
    queryClient.invalidateQueries({ queryKey: ['eventos', ticket.eventCode] }),
  ])
}

export function useMisTickets(email: string) {
  return useQuery({
    queryKey: ['tickets', email],
    queryFn: ({ signal }) => listarTicketsPorUsuario(email, signal),
    enabled: email.length > 0,
    staleTime: 15_000,
  })
}

export function useTicket(ticketCode: string) {
  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: ({ signal }) => obtenerTicket(ticketCode, signal),
    enabled: ticketCode.length > 0,
    staleTime: 30_000,
  })
}

export function useTicketsPagadosPorEvento(eventCode: string) {
  return useQuery({
    queryKey: ['tickets', 'pagados', eventCode],
    queryFn: ({ signal }) => listarTicketsPagados(eventCode, signal),
    enabled: eventCode.length > 0,
    staleTime: 30_000,
  })
}

export function useComprarTicket(email: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: comprarTicket,
    onSuccess: (ticket) => invalidarCacheCompra(queryClient, email, ticket),
  })
}

export function useCancelarTicket(email: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarTicket,
    onSuccess: (ticket) =>
      invalidarCacheCancelacion(queryClient, email, ticket),
  })
}

export function useUsarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usarTicket,
    onSuccess: (ticket) => invalidarCacheUso(queryClient, ticket),
  })
}
