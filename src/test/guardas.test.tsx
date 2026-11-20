import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import RutaPorRol from '../layouts/RutaPorRol'
import RutaProtegida from '../layouts/RutaProtegida'
import { AuthContext, type ContextoAuth } from '../funcionalidades/auth/contexto'

const anonima: ContextoAuth = {
  sesion: { estado: 'anonimo' },
  iniciarSesion: async () => undefined,
  cerrarSesion: () => undefined,
  tieneRol: () => false,
}

const user: ContextoAuth = {
  ...anonima,
  sesion: {
    estado: 'autenticado',
    token: 'token',
    expiraEn: Date.now() + 60_000,
    usuario: { userId: 1, username: 'andrea', email: 'andrea@example.test', roles: ['USER'] },
  },
  tieneRol: (...roles) => roles.includes('USER'),
}

function renderGuard(element: ReactNode, auth: ContextoAuth, path: string) {
  return render(
    <AuthContext value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={element} path={path}>
            <Route element={<p>contenido protegido</p>} index />
          </Route>
          <Route path="/login" element={<p>login</p>} />
          <Route path="/403" element={<p>sin permisos</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext>,
  )
}

describe('guardas de navegación', () => {
  it('TEST-FE-GUARD-001 redirige anónimos al login', () => {
    renderGuard(<RutaProtegida />, anonima, '/privado')
    expect(screen.getByText('login')).toBeInTheDocument()
  })

  it('TEST-FE-GUARD-002 rechaza USER en una ruta ADMIN', () => {
    renderGuard(<RutaPorRol roles={['ADMIN']} />, user, '/admin')
    expect(screen.getByText('sin permisos')).toBeInTheDocument()
  })
})
