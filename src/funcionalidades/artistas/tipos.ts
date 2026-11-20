import { z } from 'zod'

// ArtistResponse (backend)
export const ArtistaSchema = z.object({
  id: z.number(),
  stageName: z.string(),
  country: z.string().nullish(),
  genre: z.string().nullish(),
  active: z.boolean(),
  imageUrl: z.string().nullish(),
})
export type Artista = z.infer<typeof ArtistaSchema>
