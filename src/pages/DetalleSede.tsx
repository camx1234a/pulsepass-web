import { Link, useParams } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Tarjeta from '../componentes/Tarjeta'
import { useSede } from '../funcionalidades/sedes/hooks'
import { RUTAS } from '../lib/rutas'
import { ApiError } from '../lib/http'

export default function DetalleSede() {
  const { code = '' } = useParams()
  const sede = useSede(code)

  if (sede.isPending) return <Cargando lineas={8} />
  if (sede.isError) {
    if (sede.error instanceof ApiError && sede.error.status === 404) return <PaginaCodigo codigo="404" mensaje="No encontramos esta sede." />
    return <EstadoError mensaje={sede.error.message} onReintentar={() => sede.refetch()} />
  }

  return (
    <div className="space-y-6">
      <Link to={RUTAS.sedes} className="text-sm font-semibold text-marca-600 dark:text-marca-500">← Todas las sedes</Link>
      <Tarjeta className="p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-marca-600 dark:text-marca-500">{sede.data.code}</p>
        <h1 className="mt-2 text-3xl font-bold">{sede.data.name}</h1>
        <dl className="mt-6 grid gap-5 sm:grid-cols-3">
          <div><dt className="text-sm text-slate-500">Ciudad</dt><dd className="mt-1 font-semibold">{sede.data.city}</dd></div>
          <div><dt className="text-sm text-slate-500">Capacidad</dt><dd className="mt-1 font-semibold">{sede.data.capacity.toLocaleString('es-CO')} personas</dd></div>
          <div><dt className="text-sm text-slate-500">Dirección</dt><dd className="mt-1 font-semibold">{sede.data.address || 'No registrada'}</dd></div>
        </dl>
      </Tarjeta>
    </div>
  )
}
