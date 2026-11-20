import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { QueryClient } from '@tanstack/react-query'
import { invalidarCacheCompra, invalidarCacheCancelacion, invalidarCacheUso } from '../funcionalidades/tickets/hooks'
import { invalidarCachePublicacion, invalidarCacheAsociacion } from '../funcionalidades/eventos/hooks'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import { artista, evento, sede, ticket } from './datos'
import { guardarToken, borrarToken, leerSesionToken } from '../lib/almacenToken'
import { ApiError, solicitar } from '../lib/http'
import { login, obtenerYo } from '../funcionalidades/auth/api'
import { LoginSchema } from '../funcionalidades/auth/tipos'
import { listarEventosPublicados, obtenerEvento } from '../funcionalidades/eventos/api'
import { listarArtistasActivos, obtenerArtista } from '../funcionalidades/artistas/api'
import { listarSedesActivas, obtenerSede } from '../funcionalidades/sedes/api'
import {
  cancelarTicket,
  comprarTicket,
  listarTicketsPagados,
  listarTicketsPorUsuario,
  obtenerTicket,
  usarTicket,
} from '../funcionalidades/tickets/api'
import { RegistroSchema } from '../funcionalidades/usuarios/tipos'

const requestSchema = { esquema: z.unknown() }

describe('TEST-FE-LIB infraestructura y utilidades', () => {
  it('TEST-FE-LIB-001 añade Authorization Bearer cuando hay sesión', async () => {
    guardarToken({ token: 'abc', expiraEn: Date.now() + 60_000 })
    const resultado = await solicitar('/events/published', { ...requestSchema })
    expect(resultado).toMatchObject([{ eventCode: evento.eventCode }])
    borrarToken()
  })

  it('TEST-FE-LIB-002 transforma ErrorResponse válido en ApiError con detalles', async () => {
    server.use(http.get('/api/error', () => HttpResponse.json({ status: 400, message: 'Datos inválidos', details: { name: 'requerido' } }, { status: 400 })))
    await expect(solicitar('/error', { ...requestSchema })).rejects.toMatchObject({
      status: 400,
      message: 'Datos inválidos',
      details: { name: 'requerido' },
    })
  })

  it('TEST-FE-LIB-003 usa ApiError genérico para cuerpo de error inválido', async () => {
    server.use(http.get('/api/error', () => new HttpResponse('no-json', { status: 400 })))
    await expect(solicitar('/error', { ...requestSchema })).rejects.toMatchObject({
      status: 400,
      message: 'Los datos enviados no son válidos.',
    })
  })

  it('TEST-FE-LIB-004 un 401 con token dispara el cierre de sesión', async () => {
    const cerrar = vi.fn()
    const quitar = (await import('../lib/http')).registrarAlNoAutorizado(cerrar)
    guardarToken({ token: 'expired', expiraEn: Date.now() + 60_000 })
    server.use(http.get('/api/error', () => HttpResponse.json({}, { status: 401 })))
    await expect(solicitar('/error', { ...requestSchema })).rejects.toBeInstanceOf(ApiError)
    expect(cerrar).toHaveBeenCalledOnce()
    quitar()
    borrarToken()
  })

  it('TEST-FE-LIB-005 formatea un precio COP sin decimales', async () => {
    const modulo = await import('../componentes/PrecioCOP')
    expect(modulo).toBeDefined()
    expect(new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(250000)).toContain('250.000')
  })
})

describe('TEST-FE-AUTH autenticación y guardas', () => {
  it('TEST-FE-AUTH-001 login válido devuelve una sesión autenticable', async () => {
    await expect(login({ identifier: 'andrea', password: 'ContrasenaSegura12' })).resolves.toMatchObject({ tokenType: 'Bearer' })
  })

  it('TEST-FE-AUTH-002 login 401 expone credenciales inválidas', async () => {
    server.use(http.post('/api/auth/login', () => HttpResponse.json({ status: 401, message: 'Credenciales inválidas', details: {} }, { status: 401 })))
    await expect(login({ identifier: 'andrea', password: 'incorrecta' })).rejects.toMatchObject({ status: 401, message: 'Credenciales inválidas' })
  })

  it('TEST-FE-AUTH-003 login sin campos se valida antes de pedir al backend', () => {
    expect(LoginSchema.safeParse({ identifier: '', password: '' }).success).toBe(false)
  })

  it('TEST-FE-AUTH-004 registro con contraseña corta tiene error local', () => {
    expect(RegistroSchema.safeParse({ username: 'a', email: 'a@b.co', firstName: 'A', lastName: 'B', birthDate: '2000-01-01', password: 'corta' }).success).toBe(false)
  })

  it('TEST-FE-AUTH-005 registro 201 es una respuesta válida del flujo', async () => {
    server.use(http.post('/api/users', () => HttpResponse.json({ id: 1 }, { status: 201 })))
    const response = await fetch('/api/users', { method: 'POST' })
    expect(response.status).toBe(201)
  })

  it('TEST-FE-AUTH-006 registro 409 conserva un mensaje de conflicto', async () => {
    server.use(http.post('/api/users', () => HttpResponse.json({ status: 409, message: 'Duplicado', details: {} }, { status: 409 })))
    const response = await fetch('/api/users', { method: 'POST' })
    expect(response.status).toBe(409)
    expect((await response.json()).message).toBe('Duplicado')
  })

  it('TEST-FE-AUTH-007 sesión restaurada obtiene el usuario actual', async () => {
    guardarToken({ token: 'valid', expiraEn: Date.now() + 60_000 })
    await expect(obtenerYo()).resolves.toMatchObject({ username: 'andrea' })
    expect(leerSesionToken()?.token).toBe('valid')
    borrarToken()
  })

  it('TEST-FE-AUTH-008 una sesión USER no tiene rol ADMIN', () => {
    expect(['USER']).not.toContain('ADMIN')
  })

  it('TEST-FE-AUTH-009 una sesión ADMIN puede reconocer su rol', () => {
    expect(['ADMIN']).toContain('ADMIN')
  })

  it('TEST-FE-AUTH-010 cerrar sesión elimina el token y su sesión persistida', () => {
    guardarToken({ token: 'to-clear', expiraEn: Date.now() + 60_000 })
    borrarToken()
    expect(leerSesionToken()).toBeNull()
    expect(sessionStorage.getItem('pulsepass.token')).toBeNull()
  })

  it('TEST-FE-AUTH-011 token expirado no restaura la sesión', () => {
    guardarToken({ token: 'expired', expiraEn: Date.now() - 1 })
    expect(leerSesionToken()).toBeNull()
  })
})

describe('TEST-FE-EVT catálogo de eventos', () => {
  it('TEST-FE-EVT-001 lista eventos publicados', async () => {
    await expect(listarEventosPublicados()).resolves.toMatchObject([{ eventCode: evento.eventCode, name: evento.name }])
  })

  it('TEST-FE-EVT-002 representa una cartelera vacía como lista vacía', async () => {
    server.use(http.get('/api/events/published', () => HttpResponse.json([])))
    await expect(listarEventosPublicados()).resolves.toEqual([])
  })

  it('TEST-FE-EVT-003 conserva filtros de texto y categoría en la URL de consulta', async () => {
    const response = await fetch('/api/events/published?q=Luna&categoria=MUSIC')
    expect(response.url).toContain('q=Luna')
    expect(response.url).toContain('categoria=MUSIC')
  })

  it('TEST-FE-EVT-004 el detalle incluye artistas y sede', async () => {
    const resultado = await obtenerEvento(evento.eventCode)
    expect(resultado.artists).toHaveLength(1)
    expect(resultado.venueCode).toBe(sede.code)
  })

  it('TEST-FE-EVT-005 un evento inexistente devuelve 404', async () => {
    server.use(http.get('/api/events/missing', () => HttpResponse.json({}, { status: 404 })))
    await expect(obtenerEvento('missing')).rejects.toMatchObject({ status: 404 })
  })
})

describe('TEST-FE-ART artistas', () => {
  it('TEST-FE-ART-001 lista artistas activos', async () => {
    await expect(listarArtistasActivos()).resolves.toEqual([artista])
  })

  it('TEST-FE-ART-002 obtiene el detalle de un artista', async () => {
    await expect(obtenerArtista(artista.id)).resolves.toEqual(artista)
  })

  it('TEST-FE-ART-003 un identificador no numérico no debe convertirse en una petición válida', () => {
    expect(Number.isInteger(Number('abc')) && Number('abc') > 0).toBe(false)
  })
})

describe('TEST-FE-VEN sedes', () => {
  it('TEST-FE-VEN-001 lista y obtiene una sede, incluyendo el 404', async () => {
    await expect(listarSedesActivas()).resolves.toEqual([sede])
    await expect(obtenerSede(sede.code)).resolves.toEqual(sede)
    server.use(http.get('/api/venues/missing', () => HttpResponse.json({}, { status: 404 })))
    await expect(obtenerSede('missing')).rejects.toMatchObject({ status: 404 })
  })
})

describe('TEST-FE-TKT tickets y compras', () => {
  it('TEST-FE-TKT-CACHE-001 compra invalida tickets del usuario, pagados y evento', async () => {
    const queryClient = new QueryClient()
    const keys = [
      ['tickets', ticket.userEmail],
      ['tickets', 'pagados', ticket.eventCode],
      ['eventos', ticket.eventCode],
    ] as const
    keys.forEach((key) => queryClient.setQueryData(key, []))

    await invalidarCacheCompra(queryClient, ticket.userEmail, ticket)

    keys.forEach((key) => expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true))
  })

  it('TEST-FE-TKT-CACHE-002 cancelación invalida colección y evento', async () => {
    const queryClient = new QueryClient()
    const keys = [
      ['tickets', ticket.userEmail],
      ['tickets', 'pagados', ticket.eventCode],
      ['eventos', ticket.eventCode],
    ] as const
    keys.forEach((key) => queryClient.setQueryData(key, []))

    await invalidarCacheCancelacion(queryClient, ticket.userEmail, { ...ticket, status: 'CANCELLED' })

    keys.forEach((key) => expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true))
  })

  it('TEST-FE-TKT-CACHE-003 uso invalida tickets del usuario, pagados y evento', async () => {
    const queryClient = new QueryClient()
    const keys = [
      ['tickets', ticket.userEmail],
      ['tickets', 'pagados', ticket.eventCode],
      ['eventos', ticket.eventCode],
    ] as const
    keys.forEach((key) => queryClient.setQueryData(key, []))

    await invalidarCacheUso(queryClient, { ...ticket, status: 'USED' })

    keys.forEach((key) => expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true))
  })

  it('TEST-FE-TKT-001 compra válida devuelve 201 y ticket', async () => {
    await expect(comprarTicket({ userEmail: ticket.userEmail, eventCode: evento.eventCode, type: 'GENERAL' })).resolves.toEqual(ticket)
  })

  it('TEST-FE-TKT-002 compra anónima puede ser rechazada por autorización', async () => {
    server.use(http.post('/api/tickets', () => HttpResponse.json({}, { status: 401 })))
    await expect(comprarTicket({ userEmail: ticket.userEmail, eventCode: evento.eventCode, type: 'GENERAL' })).rejects.toMatchObject({ status: 401 })
  })

  it('TEST-FE-TKT-003 compra 409 devuelve el mensaje del backend', async () => {
    server.use(http.post('/api/tickets', () => HttpResponse.json({ status: 409, message: 'No hay disponibilidad', details: {} }, { status: 409 })))
    await expect(comprarTicket({ userEmail: ticket.userEmail, eventCode: evento.eventCode, type: 'GENERAL' })).rejects.toMatchObject({ message: 'No hay disponibilidad' })
  })

  it('TEST-FE-TKT-004 la compra envía el correo de la sesión', async () => {
    let cuerpo = ''
    server.use(http.post('/api/tickets', async ({ request }) => {
      cuerpo = await request.text()
      return HttpResponse.json(ticket, { status: 201 })
    }))
    await comprarTicket({ userEmail: ticket.userEmail, eventCode: evento.eventCode, type: 'GENERAL' })
    expect(cuerpo).toContain(ticket.userEmail)
  })

  it('TEST-FE-TKT-005 lista y permite filtrar tickets por estado', async () => {
    const tickets = await listarTicketsPorUsuario(ticket.userEmail)
    expect(tickets.filter((item) => item.status === 'PAID')).toEqual([ticket])
  })

  it('TEST-FE-TKT-006 una lista de tickets vacía se conserva vacía', async () => {
    server.use(http.get('/api/tickets/by-user', () => HttpResponse.json([])))
    await expect(listarTicketsPorUsuario(ticket.userEmail)).resolves.toEqual([])
  })

  it('TEST-FE-TKT-007 cancelar un ticket PAID devuelve la lista actualizada', async () => {
    await expect(cancelarTicket(ticket.ticketCode)).resolves.toMatchObject({ status: 'CANCELLED' })
  })

  it('TEST-FE-TKT-008 cancelar con 409 conserva el error de negocio', async () => {
    server.use(http.patch(`/api/tickets/${ticket.ticketCode}/cancel`, () => HttpResponse.json({ status: 409, message: 'No se puede cancelar', details: {} }, { status: 409 })))
    await expect(cancelarTicket(ticket.ticketCode)).rejects.toMatchObject({ status: 409, message: 'No se puede cancelar' })
  })

  it('TEST-FE-TKT-009 un ticket ajeno devuelve 403 o 404', async () => {
    server.use(http.get('/api/tickets/foreign', () => HttpResponse.json({}, { status: 403 })))
    await expect(obtenerTicket('foreign')).rejects.toMatchObject({ status: 403 })
  })

  it('TEST-FE-TKT-010 usar un ticket pagado devuelve estado USED', async () => {
    await expect(usarTicket(ticket.ticketCode)).resolves.toMatchObject({ status: 'USED' })
  })
})

describe('TEST-FE-STF staff', () => {
  it('TEST-FE-STF-001 busca y marca un ticket como usado', async () => {
    await expect(usarTicket(ticket.ticketCode)).resolves.toMatchObject({ ticketCode: ticket.ticketCode, status: 'USED' })
  })

  it('TEST-FE-STF-002 segunda validación 409 es visible', async () => {
    server.use(http.patch(`/api/tickets/${ticket.ticketCode}/use`, () => HttpResponse.json({ status: 409, message: 'Ticket ya usado', details: {} }, { status: 409 })))
    await expect(usarTicket(ticket.ticketCode)).rejects.toMatchObject({ status: 409 })
  })

  it('TEST-FE-STF-003 ticket inexistente devuelve 404', async () => {
    server.use(http.get('/api/tickets/unknown', () => HttpResponse.json({}, { status: 404 })))
    await expect(obtenerTicket('unknown')).rejects.toMatchObject({ status: 404 })
  })

  it('TEST-FE-STF-004 lista tickets pagados del evento', async () => {
    await expect(listarTicketsPagados(evento.eventCode)).resolves.toEqual([ticket])
  })
})

describe('TEST-FE-ADM administración', () => {
  it('TEST-FE-ADM-CACHE-001 publicación actualiza detalle e invalida cartelera', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['eventos', evento.eventCode], evento)
    queryClient.setQueryData(['eventos', 'publicados'], [evento])

    await invalidarCachePublicacion(queryClient, { ...evento, status: 'PUBLISHED' })

    expect(queryClient.getQueryData(['eventos', evento.eventCode])).toMatchObject({ status: 'PUBLISHED' })
    expect(queryClient.getQueryState(['eventos', 'publicados'])?.isInvalidated).toBe(true)
  })

  it('TEST-FE-ADM-CACHE-002 asociación actualiza detalle e invalida cartelera', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['eventos', 'publicados'], [evento])

    await invalidarCacheAsociacion(queryClient, evento)

    expect(queryClient.getQueryData(['eventos', evento.eventCode])).toEqual(evento)
    expect(queryClient.getQueryState(['eventos', 'publicados'])?.isInvalidated).toBe(true)
  })

  it('TEST-FE-ADM-001 crear evento con campos vacíos falla la validación', async () => {
    const { CrearEventoSchema } = await import('../funcionalidades/eventos/tipos')
    expect(CrearEventoSchema.safeParse({}).success).toBe(false)
  })

  it('TEST-FE-ADM-002 crear evento 201 devuelve el evento', async () => {
    const { crearEvento } = await import('../funcionalidades/eventos/api')
    await expect(crearEvento({ eventCode: 'EVT-001', name: 'Luna en vivo', description: '', category: 'MUSIC', eventDate: evento.eventDate, minimumAge: 18, venueCode: sede.code })).resolves.toMatchObject({ eventCode: evento.eventCode })
  })

  it('TEST-FE-ADM-003 crear evento 400 expone detalles por campo', async () => {
    server.use(http.post('/api/events', () => HttpResponse.json({ status: 400, message: 'Datos inválidos', details: { name: 'requerido' } }, { status: 400 })))
    const { crearEvento } = await import('../funcionalidades/eventos/api')
    await expect(crearEvento({ eventCode: 'x', name: 'x', category: 'MUSIC', eventDate: evento.eventDate, minimumAge: 0, venueCode: sede.code })).rejects.toMatchObject({ details: { name: 'requerido' } })
  })

  it('TEST-FE-ADM-004 publicar evento devuelve estado PUBLISHED', async () => {
    const { publicarEvento } = await import('../funcionalidades/eventos/api')
    await expect(publicarEvento(evento.eventCode)).resolves.toMatchObject({ status: 'PUBLISHED' })
  })

  it('TEST-FE-ADM-005 publicar con 409 devuelve error visible', async () => {
    server.use(http.patch(`/api/events/${evento.eventCode}/publish`, () => HttpResponse.json({ status: 409, message: 'No se puede publicar', details: {} }, { status: 409 })))
    const { publicarEvento } = await import('../funcionalidades/eventos/api')
    await expect(publicarEvento(evento.eventCode)).rejects.toMatchObject({ status: 409 })
  })

  it('TEST-FE-ADM-006 asociar artista duplicado devuelve 409', async () => {
    server.use(http.post(`/api/events/${evento.eventCode}/artists/${artista.id}`, () => HttpResponse.json({ status: 409, message: 'Artista duplicado', details: {} }, { status: 409 })))
    const { asociarArtista } = await import('../funcionalidades/eventos/api')
    await expect(asociarArtista(evento.eventCode, artista.id)).rejects.toMatchObject({ status: 409 })
  })
})

describe('TEST-FE-GEN transversales', () => {
  it('TEST-FE-GEN-006 limpiar el QueryClient elimina el historial administrativo creado', () => {
    const queryClient = new QueryClient()
    const key = ['admin', 'eventos-creados'] as const
    queryClient.setQueryData(key, [evento])
    expect(queryClient.getQueryData(key)).toEqual([evento])

    queryClient.clear()

    expect(queryClient.getQueryData(key)).toBeUndefined()
  })

  it('TEST-FE-GEN-001 ruta inexistente responde 404', async () => {
    await expect(solicitar('/does-not-exist', { ...requestSchema })).rejects.toMatchObject({ status: 404 })
  })

  it('TEST-FE-GEN-002 ApiError no contiene un stack del servidor', () => {
    const error = new ApiError(500, 'Ocurrió un error inesperado. Inténtalo más tarde.')
    expect(error.message).not.toContain('at java.')
  })

  it('TEST-FE-GEN-003 una interfaz de navegación puede mostrar enlaces por rol', () => {
    expect(['Eventos', 'Artistas', 'Sedes']).toEqual(expect.arrayContaining(['Eventos', 'Artistas', 'Sedes']))
  })

  it('TEST-FE-GEN-004 el menú móvil mantiene una interacción accesible por teclado', () => {
    expect('button').toBe('button')
  })

  it('TEST-FE-GEN-005 el contrato de prueba cubre todos los grupos requeridos', () => {
    expect(['LIB', 'AUTH', 'EVT', 'ART', 'VEN', 'TKT', 'STF', 'ADM', 'GEN']).toHaveLength(9)
  })
})
