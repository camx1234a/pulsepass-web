import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import CatalogoEventos from '../pages/CatalogoEventos'
import DetalleEvento from '../pages/DetalleEvento'
import Login from '../pages/Login'
import { AuthContext, type ContextoAuth } from '../funcionalidades/auth/contexto'
import { server } from './server'

const authAnonima: ContextoAuth = {
  sesion: { estado: 'anonimo' },
  iniciarSesion: async () => undefined,
  cerrarSesion: () => undefined,
  tieneRol: () => false,
}

function renderWithProviders(ui: ReactNode, initialEntries = ['/'], auth: ContextoAuth = authAnonima) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext value={auth}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </AuthContext>
    </QueryClientProvider>,
  )
}

function RutaActual() {
  return <output data-testid="ruta-actual">{useLocation().search}</output>
}

describe('páginas y formularios requeridos', () => {
  it('TEST-FE-PAGE-001 muestra la cartelera con eventos publicados', async () => {
    renderWithProviders(<CatalogoEventos />)
    expect(await screen.findByText('Luna en vivo')).toBeInTheDocument()
  })

  it('TEST-FE-PAGE-002 muestra estado vacío cuando no hay eventos', async () => {
    server.use(http.get('/api/events/published', () => HttpResponse.json([])))
    renderWithProviders(<CatalogoEventos />)
    expect(await screen.findByText('Aún no hay eventos publicados')).toBeInTheDocument()
  })

  it('TEST-FE-PAGE-003 actualizar un filtro modifica la URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="*" element={<><CatalogoEventos /><RutaActual /></>} />
      </Routes>,
    )
    const buscar = await screen.findByPlaceholderText('Buscar por nombre…')
    await user.type(buscar, 'Luna')
    await waitFor(() => expect(screen.getByTestId('ruta-actual')).toHaveTextContent('q=Luna'))
  })

  it('TEST-FE-PAGE-004 login sin datos muestra errores de formulario', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findAllByText(/Ingresa tu/)).toHaveLength(2)
  })

  it('TEST-FE-PAGE-005 detalle de evento muestra artistas y sede', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
      </Routes>,
      ['/eventos/EVT-001'],
    )
    expect(await screen.findByText('Luna Norte')).toBeInTheDocument()
    expect(screen.getByText('Centro Metropolitano')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-005 oculta la compra cuando el evento no está publicado', async () => {
    server.use(http.get('/api/events/EVT-001', () => HttpResponse.json({
      id: 1,
      eventCode: 'EVT-001',
      name: 'Evento borrador',
      category: 'MUSIC',
      status: 'DRAFT',
      eventDate: '2026-12-12T20:00',
      venueCode: 'CMF-2026',
      venueName: 'Centro Metropolitano',
      imageUrl: null,
      description: 'Borrador',
      minimumAge: 18,
      artists: [],
    })))
    renderWithProviders(
      <Routes>
        <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
      </Routes>,
      ['/eventos/EVT-001'],
    )
    expect(await screen.findByText('Evento borrador')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Comprar entrada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument()
  })

  it('TEST-FE-ROL-001 STAFF autenticado no puede abrir la compra', async () => {
    const authStaff: ContextoAuth = {
      sesion: {
        estado: 'autenticado',
        token: 'staff-token',
        expiraEn: Date.now() + 60_000,
        usuario: {
          userId: 2,
          username: 'staff',
          email: 'staff@example.test',
          roles: ['STAFF'],
        },
      },
      iniciarSesion: async () => undefined,
      cerrarSesion: () => undefined,
      tieneRol: (...roles) => roles.includes('STAFF'),
    }
    renderWithProviders(
      <Routes>
        <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
        <Route path="/403" element={<p>sin permisos</p>} />
      </Routes>,
      ['/eventos/EVT-001'],
      authStaff,
    )
    expect(await screen.findByText('Luna en vivo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Comprar entrada' })).not.toBeInTheDocument()
  })
})
