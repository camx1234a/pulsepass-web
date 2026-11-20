import { z } from 'zod'

// ArtistResponse (backend): id, stageName, country, genre, active
export const ArtistaSchema = z.object({
  id: z.number(),
  stageName: z.string(),
  country: z.string().nullish(),
  genre: z.string().nullish(),
  active: z.boolean(),
})
export type Artista = z.infer<typeof ArtistaSchema>