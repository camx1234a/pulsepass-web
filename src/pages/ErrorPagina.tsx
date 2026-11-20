import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import Boton from '../componentes/Boton'
import { clasesBoton } from '../componentes/estilos'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Tarjeta from '../componentes/Tarjeta'
import { RUTAS } from '../lib/rutas'

export default function ErrorPagina() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <PaginaCodigo codigo="404" mensaje="No encontramos esta página." />
  }
  if (isRouteErrorResponse(error) && error.status === 403) {
    return <PaginaCodigo codigo="403" mensaje="No tienes permisos para acceder a esta sección." />
  }

  // Mensaje seguro: nunca se muestra error.message ni el stack (sección 9.19).
  return (
    <Tarjeta className="mx-auto my-8 max-w-lg space-y-3 p-6">
      <h1 className="text-xl font-bold">¡Ups! Algo salió mal.</h1>
      <p className="text-slate-600 dark:text-slate-400">Ocurrió un error inesperado. Inténtalo más tarde.</p>
      <div className="flex gap-2">
        <Boton onClick={() => window.location.reload()}>Reintentar</Boton>
        <Link to={RUTAS.inicio} className={clasesBoton('secundario')}>Volver al inicio</Link>
      </div>
    </Tarjeta>
  )
}