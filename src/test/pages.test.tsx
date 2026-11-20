import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import type { ComponentType, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import CatalogoEventos from '../pages/CatalogoEventos'
import DetalleEvento from '../pages/DetalleEvento'
import Login from '../pages/Login'
import Registro from '../pages/Registro'
import AccionesTicket from '../componentes/AccionesTicket'
import Navbar from '../layouts/Navbar'
import { evento, ticket } from './datos'
import {
  AuthContext,
  type ContextoAuth,
} from '../funcionalidades/auth/contexto'
import { server } from './server'
import Inicio from '../pages/Inicio'
import ListaArtistas from '../pages/ListaArtistas'
import DetalleArtista from '../pages/DetalleArtista'
import ListaSedes from '../pages/ListaSedes'
import DetalleSede from '../pages/DetalleSede'
import Cuenta from '../pages/Cuenta'
import MisTickets from '../pages/MisTickets'
import DetalleTicket from '../pages/DetalleTicket'
import ConfirmacionCompra from '../pages/ConfirmacionCompra'
import ValidacionIngreso from '../pages/ValidacionIngreso'
import TicketsPagadosEvento from '../pages/TicketsPagadosEvento'
import AdminEventos from '../pages/AdminEventos'
import AdminCrearEvento from '../pages/AdminCrearEvento'
import AdminGestionEvento from '../pages/AdminGestionEvento'
import SinPermisos from '../pages/SinPermisos'
import NoEncontrada from '../pages/NoEncontrada'
import VisualEvento from '../componentes/VisualEvento'

const authAnonima: ContextoAuth = {
  sesion: { estado: 'anonimo' },
  iniciarSesion: async () => undefined,
  cerrarSesion: () => undefined,
  tieneRol: () => false,
}

const authUser: ContextoAuth = {
  sesion: {
    estado: 'autenticado',
    token: 'user-token',
    expiraEn: Date.now() + 60_000,
    usuario: {
      userId: 1,
      username: 'andrea',
      email: 'andrea@example.test',
      roles: ['USER'],
    },
  },
  iniciarSesion: async () => undefined,
  cerrarSesion: () => undefined,
  tieneRol: (...roles) => roles.includes('USER'),
}

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

const authAdmin: ContextoAuth = {
  sesion: {
    estado: 'autenticado',
    token: 'admin-token',
    expiraEn: Date.now() + 60_000,
    usuario: {
      userId: 3,
      username: 'admin',
      email: 'admin@pulsepass.test',
      roles: ['ADMIN', 'USER'],
    },
  },
  iniciarSesion: async () => undefined,
  cerrarSesion: () => undefined,
  tieneRol: (...roles) =>
    roles.some((rol) => rol === 'ADMIN' || rol === 'USER'),
}

function renderWithProviders(
  ui: ReactNode,
  initialEntries: Parameters<typeof MemoryRouter>[0]['initialEntries'] = ['/'],
  auth: ContextoAuth = authAnonima,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
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
    expect(
      await screen.findByText('Aún no hay eventos publicados'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-PAGE-003 actualizar un filtro modifica la URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route
          path="*"
          element={
            <>
              <CatalogoEventos />
              <RutaActual />
            </>
          }
        />
      </Routes>,
    )
    const buscar = await screen.findByPlaceholderText('Buscar por nombre…')
    await user.type(buscar, 'Luna')
    await waitFor(() =>
      expect(screen.getByTestId('ruta-actual')).toHaveTextContent('q=Luna'),
    )
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
    expect(await screen.findByText('Bogotá')).toBeInTheDocument()
    expect(screen.getByText(/personas/)).toBeInTheDocument()
  })

  it('Mis tickets expone el filtro activo con aria-pressed', async () => {
    renderWithProviders(<MisTickets />, ['/mis-tickets'], authUser)
    const todos = await screen.findByRole('button', { name: 'Todos' })
    expect(todos).toHaveAttribute('aria-pressed', 'true')
    await userEvent.setup().click(screen.getByRole('button', { name: 'PAID' }))
    expect(screen.getByRole('button', { name: 'PAID' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('la validación rechaza códigos sin prefijo y limpia el resultado anterior', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ValidacionIngreso />, ['/staff/validacion'], authStaff)
    const codigo = await screen.findByLabelText('Código de ticket')
    await user.type(codigo, '123')
    await user.click(screen.getByRole('button', { name: 'Buscar ticket' }))
    expect(
      await screen.findByText(/empezar por TCK-|debe empezar por TCK-/),
    ).toBeInTheDocument()
    await user.clear(codigo)
    await user.type(codigo, 'TCK-8f2a1c-4b1d')
    await user.click(screen.getByRole('button', { name: 'Buscar ticket' }))
    expect(await screen.findByText('Luna en vivo')).toBeInTheDocument()
  })

  it('STAFF puede abrir la consulta de tickets pagados desde el navbar', () => {
    renderWithProviders(<Navbar />, ['/'], authStaff)
    expect(
      screen.getAllByRole('link', { name: 'Tickets pagados' }).length,
    ).toBeGreaterThan(0)
  })

  it('TEST-FE-EVT-005 oculta la compra cuando el evento no está publicado', async () => {
    server.use(
      http.get('/api/events/EVT-001', () =>
        HttpResponse.json({
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
        }),
      ),
    )
    renderWithProviders(
      <Routes>
        <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
      </Routes>,
      ['/eventos/EVT-001'],
    )
    expect(await screen.findByText('Evento borrador')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Comprar entrada' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Comprar entrada' }),
    ).not.toBeInTheDocument()
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
    expect(
      screen.queryByRole('button', { name: 'Comprar entrada' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Comprar entrada' }),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-EVT-006 oculta la compra para eventos SOLD_OUT', async () => {
    server.use(
      http.get('/api/events/EVT-001', () =>
        HttpResponse.json({
          id: 1,
          eventCode: 'EVT-001',
          name: 'Evento agotado',
          category: 'MUSIC',
          status: 'SOLD_OUT',
          eventDate: '2026-12-12T20:00',
          venueCode: 'CMF-2026',
          venueName: 'Centro Metropolitano',
          imageUrl: null,
          description: 'Agotado',
          minimumAge: 18,
          artists: [],
        }),
      ),
    )
    renderWithProviders(
      <Routes>
        <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
      </Routes>,
      ['/eventos/EVT-001'],
    )
    expect(await screen.findByText('Evento agotado')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Comprar entrada' }),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-EVT-003 filtra por categoría y conserva el parámetro en la URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route
          path="*"
          element={
            <>
              <CatalogoEventos />
              <RutaActual />
            </>
          }
        />
      </Routes>,
    )
    await user.selectOptions(await screen.findByLabelText('Categoría'), 'MUSIC')
    await waitFor(() =>
      expect(screen.getByTestId('ruta-actual')).toHaveTextContent(
        'categoria=MUSIC',
      ),
    )
  })

  it('TEST-FE-AUTH-005 el registro exitoso redirige a login con aviso', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
      </Routes>,
      ['/registro'],
    )
    await user.type(screen.getByLabelText('Nombre de usuario'), 'andrea')
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'andrea@example.test',
    )
    await user.type(screen.getByLabelText('Nombres'), 'Andrea')
    await user.type(screen.getByLabelText('Apellidos'), 'Ruiz')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '2000-04-12')
    await user.type(screen.getByLabelText(/Contraseña/), 'ContrasenaSegura12')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(
      await screen.findByText('Cuenta creada, inicia sesión.'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-007 sesión expirada muestra aviso y conserva destino', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>,
      [
        {
          pathname: '/login',
          state: { motivo: 'expirada', desde: '/mis-tickets' },
        },
      ],
    )
    expect(await screen.findByText('Tu sesión expiró.')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-010 cancelar solo aparece para tickets PAID', () => {
    const vista = renderWithProviders(
      <AccionesTicket ticket={ticket} email={ticket.userEmail} />,
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    vista.unmount()

    renderWithProviders(
      <AccionesTicket
        ticket={{ ...ticket, status: 'CANCELLED' }}
        email={ticket.userEmail}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Cancelar' }),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-003 muestra enlaces según el rol del usuario', () => {
    const authUser: ContextoAuth = {
      sesion: {
        estado: 'autenticado',
        token: 'user-token',
        expiraEn: Date.now() + 60_000,
        usuario: {
          userId: 1,
          username: 'andrea',
          email: 'andrea@example.test',
          roles: ['USER'],
        },
      },
      iniciarSesion: async () => undefined,
      cerrarSesion: () => undefined,
      tieneRol: (...roles) => roles.includes('USER'),
    }
    renderWithProviders(<Navbar />, ['/'], authUser)
    expect(
      screen.getAllByRole('link', { name: 'Mis tickets' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryAllByRole('link', { name: 'Administrar eventos' }),
    ).toHaveLength(0)
  })

  it('TEST-FE-GEN-004 abre el menú móvil, permite navegar y vuelve el foco con Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />, ['/'])

    const abrir = screen.getByRole('button', { name: 'Abrir menú' })
    await user.click(abrir)
    expect(screen.getAllByText('Eventos').length).toBeGreaterThan(0)
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('button', { name: 'Cerrar menú' }),
    ).not.toBeInTheDocument()
    await waitFor(() => expect(document.activeElement).toBe(abrir))
  })

  it.each([
    'MUSIC',
    'SPORTS',
    'TECHNOLOGY',
    'EDUCATION',
    'CULTURE',
    'ENTERTAINMENT',
  ] as const)(
    'TEST-FE-VISUAL-%s usa el panel SVG de categoría',
    (categoria) => {
      const { container } = renderWithProviders(
        <VisualEvento categoria={categoria} />,
      )
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(container.querySelector('img')).not.toBeInTheDocument()
    },
  )

  it('TEST-FE-ADM-004 publica un evento y actualiza la interfaz', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/events/EVT-001', () =>
        HttpResponse.json({
          ...evento,
          status: 'DRAFT',
        }),
      ),
    )
    renderWithProviders(
      <Routes>
        <Route
          path="/admin/eventos/:eventCode"
          element={<AdminGestionEvento />}
        />
      </Routes>,
      ['/admin/eventos/EVT-001'],
      authAdmin,
    )
    await user.click(
      await screen.findByRole('button', { name: 'Publicar evento' }),
    )
    expect(
      screen.getByRole('heading', { name: '¿Publicar el evento?' }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Confirmar publicación' }),
    )
    expect(await screen.findByText('Evento publicado.')).toBeInTheDocument()
  })

  it.each([
    {
      nombre: 'Inicio',
      patron: '/',
      entrada: '/',
      componente: Inicio,
      auth: authAnonima,
      texto: 'Encuentra tu próximo evento',
    },
    {
      nombre: 'Cartelera',
      patron: '/eventos',
      entrada: '/eventos',
      componente: CatalogoEventos,
      auth: authAnonima,
      texto: 'Cartelera',
    },
    {
      nombre: 'Detalle de evento',
      patron: '/eventos/:eventCode',
      entrada: '/eventos/EVT-001',
      componente: DetalleEvento,
      auth: authAnonima,
      texto: 'Luna en vivo',
    },
    {
      nombre: 'Lista de artistas',
      patron: '/artistas',
      entrada: '/artistas',
      componente: ListaArtistas,
      auth: authAnonima,
      texto: 'Artistas',
    },
    {
      nombre: 'Detalle de artista',
      patron: '/artistas/:id',
      entrada: '/artistas/1',
      componente: DetalleArtista,
      auth: authAnonima,
      texto: 'Luna Norte',
    },
    {
      nombre: 'Lista de sedes',
      patron: '/sedes',
      entrada: '/sedes',
      componente: ListaSedes,
      auth: authAnonima,
      texto: 'Sedes',
    },
    {
      nombre: 'Detalle de sede',
      patron: '/sedes/:code',
      entrada: '/sedes/CMF-2026',
      componente: DetalleSede,
      auth: authAnonima,
      texto: 'Centro Metropolitano',
    },
    {
      nombre: 'Login',
      patron: '/login',
      entrada: '/login',
      componente: Login,
      auth: authAnonima,
      texto: 'Inicia sesión',
    },
    {
      nombre: 'Registro',
      patron: '/registro',
      entrada: '/registro',
      componente: Registro,
      auth: authAnonima,
      texto: 'Crea tu cuenta',
    },
    {
      nombre: 'Cuenta',
      patron: '/cuenta',
      entrada: '/cuenta',
      componente: Cuenta,
      auth: authUser,
      texto: 'Mi cuenta',
    },
    {
      nombre: 'Mis tickets',
      patron: '/mis-tickets',
      entrada: '/mis-tickets',
      componente: MisTickets,
      auth: authUser,
      texto: 'Mis tickets',
    },
    {
      nombre: 'Detalle de ticket',
      patron: '/mis-tickets/:ticketCode',
      entrada: '/mis-tickets/TCK-8f2a1c-4b1d',
      componente: DetalleTicket,
      auth: authUser,
      texto: 'Luna en vivo',
    },
    {
      nombre: 'Confirmación de compra',
      patron: '/compra/confirmacion/:ticketCode',
      entrada: '/compra/confirmacion/TCK-8f2a1c-4b1d',
      componente: ConfirmacionCompra,
      auth: authUser,
      texto: 'Compra realizada con éxito',
    },
    {
      nombre: 'Validación de ingreso',
      patron: '/staff/validacion',
      entrada: '/staff/validacion',
      componente: ValidacionIngreso,
      auth: authStaff,
      texto: 'Validación de ingreso',
    },
    {
      nombre: 'Tickets pagados',
      patron: '/staff/eventos/:eventCode/tickets',
      entrada: '/staff/eventos/EVT-001/tickets',
      componente: TicketsPagadosEvento,
      auth: authStaff,
      texto: 'Tickets pagados',
    },
    {
      nombre: 'Administración de eventos',
      patron: '/admin/eventos',
      entrada: '/admin/eventos',
      componente: AdminEventos,
      auth: authAdmin,
      texto: 'Administración de eventos',
    },
    {
      nombre: 'Crear evento',
      patron: '/admin/eventos/nuevo',
      entrada: '/admin/eventos/nuevo',
      componente: AdminCrearEvento,
      auth: authAdmin,
      texto: 'Crear evento',
    },
    {
      nombre: 'Gestionar evento',
      patron: '/admin/eventos/:eventCode',
      entrada: '/admin/eventos/EVT-001',
      componente: AdminGestionEvento,
      auth: authAdmin,
      texto: 'Luna en vivo',
    },
    {
      nombre: 'Sin permisos',
      patron: '/403',
      entrada: '/403',
      componente: SinPermisos,
      auth: authUser,
      texto: '403',
    },
    {
      nombre: 'Página no encontrada',
      patron: '*',
      entrada: '/ruta-inexistente',
      componente: NoEncontrada,
      auth: authAnonima,
      texto: '404',
    },
  ])(
    'TEST-FE-PAGE-RUTA-$nombre renderiza correctamente',
    async ({ patron, entrada, componente, auth, texto }) => {
      const Elemento = componente as ComponentType
      renderWithProviders(
        <Routes>
          <Route path={patron} element={<Elemento />} />
        </Routes>,
        [entrada],
        auth,
      )
      const encontrados = await screen.findAllByText(
        (_, elemento) => elemento?.textContent?.includes(texto) ?? false,
      )
      expect(encontrados.length).toBeGreaterThan(0)
    },
  )
})
