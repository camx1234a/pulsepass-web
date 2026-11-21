import { z } from 'zod'

const EstadoLoginSchema = z.object({
  desde: z
    .string()
    .startsWith('/')
    .refine((v) => !v.startsWith('//'))
    .optional(),
  motivo: z.literal('expirada').optional(),
  registrado: z.boolean().optional(),
})

export type EstadoLogin = z.infer<typeof EstadoLoginSchema>

export function leerEstadoLogin(state: unknown): EstadoLogin {
  const resultado = EstadoLoginSchema.safeParse(state)
  return resultado.success ? resultado.data : {}
}
