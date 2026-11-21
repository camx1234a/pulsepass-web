import { z } from 'zod'
import { solicitar } from '../../lib/http'
import { TicketSchema, type PurchaseTicketRequest } from './tipos'

export const listarTicketsPorUsuario = (email: string, signal?: AbortSignal) =>
  solicitar('/tickets/by-user', {
    params: { email },
    esquema: z.array(TicketSchema),
    signal,
  })

export const obtenerTicket = (ticketCode: string, signal?: AbortSignal) =>
  solicitar(`/tickets/${encodeURIComponent(ticketCode)}`, {
    esquema: TicketSchema,
    signal,
  })

export const comprarTicket = (datos: PurchaseTicketRequest) =>
  solicitar('/tickets', {
    metodo: 'POST',
    cuerpo: datos,
    esquema: TicketSchema,
  })

export const cancelarTicket = (ticketCode: string) =>
  solicitar(`/tickets/${encodeURIComponent(ticketCode)}/cancel`, {
    metodo: 'PATCH',
    esquema: TicketSchema,
  })

export const usarTicket = (ticketCode: string) =>
  solicitar(`/tickets/${encodeURIComponent(ticketCode)}/use`, {
    metodo: 'PATCH',
    esquema: TicketSchema,
  })

export const listarTicketsPagados = (eventCode: string, signal?: AbortSignal) =>
  solicitar(`/events/${encodeURIComponent(eventCode)}/tickets/paid`, {
    esquema: z.array(TicketSchema),
    signal,
  })
