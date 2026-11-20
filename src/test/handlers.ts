import { http, HttpResponse } from 'msw'
import { artista, evento, sede, ticket } from './datos'

const usuario = {
  userId: 7,
  id: 7,
  username: 'andrea',
  email: 'andrea@example.test',
  firstName: 'Andrea',
  lastName: 'Ruiz',
  phone: null,
  city: null,
  birthDate: '2000-04-12',
  active: true,
  roles: ['USER'] as const,
}

export const handlers = [
  http.all('/api/*', ({ request }) => {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/api/auth/login') {
      return HttpResponse.json({ accessToken: 'test-token', tokenType: 'Bearer', expiresIn: 900 })
    }
    if (path === '/api/auth/me') {
      return HttpResponse.json({ userId: usuario.userId, username: usuario.username, roles: usuario.roles })
    }
    if (path === '/api/users/by-username') return HttpResponse.json(usuario)
    if (path === '/api/users/by-email') return HttpResponse.json(usuario)
    if (path === '/api/users') return HttpResponse.json(usuario, { status: 201 })
    if (path === '/api/events/published') {
      const resumen = {
        id: evento.id,
        eventCode: evento.eventCode,
        name: evento.name,
        category: evento.category,
        status: evento.status,
        eventDate: evento.eventDate,
        venueCode: evento.venueCode,
        venueName: evento.venueName,
        imageUrl: evento.imageUrl,
      }
      return HttpResponse.json([resumen])
    }
    if (path === '/api/events/by-artist') return HttpResponse.json([evento])
    if (path === `/api/events/${evento.eventCode}`) return HttpResponse.json(evento)
    if (path === '/api/events') return HttpResponse.json(evento, { status: 201 })
    if (path.endsWith('/publish')) return HttpResponse.json({ ...evento, status: 'PUBLISHED' })
    if (path === '/api/artists/active') return HttpResponse.json([artista])
    if (path === `/api/artists/${artista.id}`) return HttpResponse.json(artista)
    if (path === '/api/artists/by-stage-name') return HttpResponse.json(artista)
    if (path.includes('/artists/')) return HttpResponse.json(evento)
    if (path === '/api/venues/active') return HttpResponse.json([sede])
    if (path === `/api/venues/${sede.code}`) return HttpResponse.json(sede)
    if (path === '/api/tickets/by-user') return HttpResponse.json([ticket])
    if (path === `/api/tickets/${ticket.ticketCode}`) return HttpResponse.json(ticket)
    if (path === '/api/tickets') return HttpResponse.json(ticket, { status: 201 })
    if (path.endsWith('/cancel')) return HttpResponse.json({ ...ticket, status: 'CANCELLED' })
    if (path.endsWith('/use')) return HttpResponse.json({ ...ticket, status: 'USED' })
    if (path.endsWith('/tickets/paid')) return HttpResponse.json([ticket])

    return HttpResponse.json({ status: 404, message: 'Not found', details: {} }, { status: 404 })
  }),
]
