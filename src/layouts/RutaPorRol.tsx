import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/hooks'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

interface RutaPorRolProps {
  roles: Rol[]
}

export default function RutaPorRol({ roles }: RutaPorRolProps) {
  const { sesion, tieneRol } = useAuth()
  const ubicacion = useLocation()

  if (sesion.estado === 'cargando') return <Cargando />
  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: ubicacion.pathname }} />
  }
  if (!tieneRol(...roles)) return <Navigate to={RUTAS.sinPermisos} replace />
  return <Outlet />
}