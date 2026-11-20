import { Link } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Tarjeta from '../componentes/Tarjeta'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { RUTAS } from '../lib/rutas'

export default function ListaSedes() {
  const sedes = useSedesActivas()
  return (
    <div className="space-y-6">
      <div>
        <p className="text-marca-600 dark:text-marca-500 text-sm font-semibold">
          Encuentra el lugar perfecto
        </p>
        <h1 className="mt-1 text-3xl font-bold">Sedes</h1>
      </div>
      {sedes.isPending && <Cargando lineas={6} />}
      {sedes.isError && (
        <EstadoError
          mensaje={sedes.error.message}
          onReintentar={() => sedes.refetch()}
        />
      )}
      {sedes.isSuccess && sedes.data.length === 0 && (
        <EstadoVacio mensaje="Aún no hay sedes activas" />
      )}
      {sedes.isSuccess && sedes.data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sedes.data.map((sede) => (
            <Link
              key={sede.id}
              to={RUTAS.sede(sede.code)}
              className="focus-visible:outline-marca-600 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Tarjeta className="h-full p-5 transition-transform hover:-translate-y-1">
                <p className="text-marca-600 dark:text-marca-500 text-xs font-semibold tracking-wide uppercase">
                  {sede.code}
                </p>
                <h2 className="mt-2 text-lg font-bold">{sede.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{sede.city}</p>
                {sede.address && (
                  <p className="mt-1 text-sm text-slate-500">{sede.address}</p>
                )}
                <p className="mt-4 text-sm font-semibold">
                  Capacidad: {sede.capacity.toLocaleString('es-CO')}
                </p>
              </Tarjeta>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
