import { z } from 'zod'
import { FechaHoraLocalSchema } from '../../lib/esquemas'

export const TicketTypeSchema = z.enum([
  'GENERAL',
  'VIP',
  'BACKSTAGE',
  'STUDENT',
])
export const TicketStatusSchema = z.enum([
  'RESERVED',
  'PAID',
  'CANCELLED',
  'USED',
])
export type TicketType = z.infer<typeof TicketTypeSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>

// TicketResponse
export const TicketSchema = z.object({
  id: z.number(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: z.number(),
  status: TicketStatusSchema,
  purchaseDate: FechaHoraLocalSchema,
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
})
export type Ticket = z.infer<typeof TicketSchema>

export const CodigoTicketSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa el código del ticket')
  .regex(/^TCK-[A-Za-z0-9-]+$/i, 'El código debe empezar por TCK-')

export const CompraSchema = z.object({ type: TicketTypeSchema })
export const BuscarTicketSchema = z.object({ ticketCode: CodigoTicketSchema })

// PurchaseTicketRequest: userEmail SIEMPRE sale de la sesión, nunca de un campo editable.
export interface PurchaseTicketRequest {
  userEmail: string
  eventCode: string
  type: TicketType
}
