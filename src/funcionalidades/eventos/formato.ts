import type { EventCategory } from './tipos'

const nombresCategoria: Record<EventCategory, string> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}

export const nombreCategoria = (categoria: EventCategory): string =>
  nombresCategoria[categoria]
