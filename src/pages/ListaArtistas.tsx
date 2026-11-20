import { Link } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Tarjeta from '../componentes/Tarjeta'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { RUTAS } from '../lib/rutas'

export default function ListaArtistas() {
  const artistas = useArtistasActivos()
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-marca-600 dark:text-marca-500">Conoce a los artistas</p><h1 className="mt-1 text-3xl font-bold">Artistas</h1></div>
      {artistas.isPending && <Cargando lineas={6} />}
      {artistas.isError && <EstadoError mensaje={artistas.error.message} onReintentar={() => artistas.refetch()} />}
      {artistas.isSuccess && artistas.data.length === 0 && <EstadoVacio mensaje="Aún no hay artistas activos" />}
      {artistas.isSuccess && artistas.data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artistas.data.map((artista) => (
            <Link key={artista.id} to={RUTAS.artista(artista.id)} className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600">
              <Tarjeta className="h-full p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-marca-100 text-xl font-bold text-marca-700 dark:bg-marca-600/20">{artista.stageName.slice(0, 1).toUpperCase()}</span>
                  <div><h2 className="font-bold">{artista.stageName}</h2><p className="text-sm text-slate-500">{artista.genre ?? 'Artista'}</p><p className="mt-1 text-xs text-slate-400">{artista.country ?? ''}</p></div>
                </div>
              </Tarjeta>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
