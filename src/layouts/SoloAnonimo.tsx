import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/hooks'
import { leerEstadoLogin } from '../lib/navegacion'
import { RUTAS } from '../lib/rutas'

export default function SoloAnonimo() {
  const { sesion } = useAuth()
  const ubicacion = useLocation()

  if (sesion.estado === 'cargando') return <Cargando />
  if (sesion.estado === 'autenticado') {
    return <Navigate to={leerEstadoLogin(ubicacion.state).desde ?? RUTAS.inicio} replace />
  }
  return <Outlet />
}