import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelarTicket, comprarTicket, listarTicketsPagados, listarTicketsPorUsuario, obtenerTicket, usarTicket } from './api'

export function useMisTickets(email: string) {
  return useQuery({
    queryKey: ['tickets', email],
    queryFn: ({ signal }) => listarTicketsPorUsuario(email, signal),
    enabled: email.length > 0,
  })
}

export function useTicket(ticketCode: string) {
  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: ({ signal }) => obtenerTicket(ticketCode, signal),
    enabled: ticketCode.length > 0,
  })
}

export function useTicketsPagadosPorEvento(eventCode: string) {
  return useQuery({
    queryKey: ['tickets', 'pagados', eventCode],
    queryFn: ({ signal }) => listarTicketsPagados(eventCode, signal),
    enabled: eventCode.length > 0,
  })
}

export function useComprarTicket(email: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: comprarTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tickets', email] })
    },
  })
}

export function useCancelarTicket(email: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarTicket,
    onSuccess: async (ticket) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', email] }),
        queryClient.setQueryData(['ticket', ticket.ticketCode], ticket),
      ])
    },
  })
}

export function useUsarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usarTicket,
    onSuccess: async (ticket) => {
      await Promise.all([
        queryClient.setQueryData(['ticket', ticket.ticketCode], ticket),
        queryClient.invalidateQueries({ queryKey: ['tickets', 'pagados', ticket.eventCode] }),
      ])
    },
  })
}
