const c = encodeURIComponent

export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  evento: (eventCode: string) => `/eventos/${c(eventCode)}`,
  artistas: '/artistas',
  artista: (id: number) => `/artistas/${id}`,
  sedes: '/sedes',
  sede: (code: string) => `/sedes/${c(code)}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticket: (ticketCode: string) => `/mis-tickets/${c(ticketCode)}`,
  confirmacionCompra: (ticketCode: string) => `/compra/confirmacion/${c(ticketCode)}`,
  staffValidacion: '/staff/validacion',
  staffTicketsPagados: (eventCode: string) => `/staff/eventos/${c(eventCode)}/tickets`,
  adminEventos: '/admin/eventos',
  adminNuevoEvento: '/admin/eventos/nuevo',
  adminEvento: (eventCode: string) => `/admin/eventos/${c(eventCode)}`,
  sinPermisos: '/403',
} as const

export const PATRONES = {
  evento: 'eventos/:eventCode',
  artista: 'artistas/:id',
  sede: 'sedes/:code',
  ticket: 'mis-tickets/:ticketCode',
  confirmacionCompra: 'compra/confirmacion/:ticketCode',
  staffTicketsPagados: 'staff/eventos/:eventCode/tickets',
  adminEvento: 'admin/eventos/:eventCode',
} as const