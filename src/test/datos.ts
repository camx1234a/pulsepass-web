export const artista = {
  id: 1,
  stageName: 'Luna Norte',
  country: 'CO',
  genre: 'POP',
  active: true,
  imageUrl: null,
}

export const sede = {
  id: 1,
  code: 'CMF-2026',
  name: 'Centro Metropolitano',
  city: 'Bogotá',
  address: 'Calle 1 # 2-3',
  capacity: 25000,
  active: true,
}

export const evento = {
  id: 1,
  eventCode: 'EVT-001',
  name: 'Luna en vivo',
  category: 'MUSIC' as const,
  status: 'PUBLISHED' as const,
  eventDate: '2026-12-12T20:00',
  venueCode: sede.code,
  venueName: sede.name,
  imageUrl: null,
  description: 'Una noche de música en vivo.',
  minimumAge: 18,
  artists: [artista],
}

export const ticket = {
  id: 1,
  ticketCode: 'TCK-8f2a1c-4b1d',
  type: 'GENERAL' as const,
  price: 250000,
  status: 'PAID' as const,
  purchaseDate: '2026-11-20T10:00',
  userEmail: 'andrea@example.test',
  eventCode: evento.eventCode,
  eventName: evento.name,
}
