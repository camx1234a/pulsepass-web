import { z } from 'zod'
import { FechaHoraLocalSchema } from '../../lib/esquemas'
import { ArtistaSchema } from '../artistas/tipos'

export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])
export const EventStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])
export type EventCategory = z.infer<typeof EventCategorySchema>
export type EventStatus = z.infer<typeof EventStatusSchema>

// EventSummaryResponse: SIN ciudad ni capacidad (solo venueCode/venueName). Cruzar con sedes.
export const EventoResumenSchema = z.object({
  id: z.number(),
  eventCode: z.string(),
  name: z.string(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: FechaHoraLocalSchema,
  venueCode: z.string(),
  venueName: z.string(),
  imageUrl: z.string().nullish(),
})
export type EventoResumen = z.infer<typeof EventoResumenSchema>

// EventResponse
export const EventoSchema = EventoResumenSchema.extend({
  description: z.string().nullish(),
  minimumAge: z.number(),
  artists: z.array(ArtistaSchema),
})
export type Evento = z.infer<typeof EventoSchema>

// CreateEventRequest (formulario ADMIN). Usa register('minimumAge', { valueAsNumber: true }).
export const CrearEventoSchema = z.object({
  eventCode: z.string().trim().min(1, 'Ingresa el código del evento'),
  name: z.string().trim().min(1, 'Ingresa el nombre'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  category: EventCategorySchema,
  eventDate: FechaHoraLocalSchema, // <input type="datetime-local"> entrega "2026-12-12T20:00"
  minimumAge: z
    .number('Ingresa la edad mínima')
    .int('Debe ser un entero')
    .min(0, 'Debe ser 0 o mayor'),
  venueCode: z.string().min(1, 'Selecciona una sede'),
  imageUrl: z
    .union([
      z
        .string()
        .trim()
        .url('Ingresa una URL válida')
        .max(1000, 'Máximo 1000 caracteres'),
      z.literal(''),
    ])
    .optional(),
})
export type CrearEventoForm = z.infer<typeof CrearEventoSchema>
