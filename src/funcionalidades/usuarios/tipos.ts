import { z } from 'zod'
import { FechaSchema } from '../../lib/esquemas'
import { fechaHoyLocal } from '../../lib/formato'

export const UsuarioSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  birthDate: FechaSchema,
  active: z.boolean(),
})
export type Usuario = z.infer<typeof UsuarioSchema>

const caracteres = (v: string): number => [...v].length
const bytes = (v: string): number => new TextEncoder().encode(v).length

export const RegistroSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Ingresa un nombre de usuario')
    .refine(
      (v) => !v.includes('@'),
      'El nombre de usuario no puede contener @',
    ),
  email: z.email('Correo electrónico inválido'),
  firstName: z.string().trim().min(1, 'Ingresa tus nombres'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos'),
  phone: z.string().optional(),
  city: z.string().optional(),
  birthDate: FechaSchema.refine(
    (v) => v <= fechaHoyLocal(),
    'La fecha no puede ser futura',
  ),
  password: z
    .string()
    .refine((v) => caracteres(v) >= 12, 'Mínimo 12 caracteres')
    .refine((v) => bytes(v) <= 72, 'Máximo 72 bytes'),
})
export type RegistroForm = z.infer<typeof RegistroSchema>
