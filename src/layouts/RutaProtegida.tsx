import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/hooks'
import { type EstadoLogin } from '../lib/navegacion.ts'
import { RUTAS } from '../lib/rutas'

/** Solo experiencia de usuario: la seguridad real la aplica el servidor (FE-004). */
export default function RutaProtegida() {
  const { sesion } = useAuth()
  const ubicacion = useLocation()

  if (sesion.estado === 'cargando') return <Cargando />

  if (sesion.estado === 'anonimo') {
    const estado: EstadoLogin = {
      desde: ubicacion.pathname + ubicacion.search,
      ...(sesion.motivo ? { motivo: sesion.motivo } : {}),
    }
    return <Navigate to={RUTAS.login} replace state={estado} />
  }

  return <Outlet />
}
