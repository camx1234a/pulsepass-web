import { z } from 'zod'

export const FechaHoraLocalSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/, 'Fecha y hora inválidas')

/** LocalDate de Java: YYYY-MM-DD. */
export const FechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')