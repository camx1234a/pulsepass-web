import { Link } from 'react-router'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Cargando from '../componentes/Cargando'
import Tarjeta from '../componentes/Tarjeta'
import TarjetaEvento from '../componentes/TarjetaEvento'
import { clasesBoton } from '../componentes/estilos'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const { sesion } = useAuth()
  const eventos = useEventosPublicados()
  const artistas = useArtistasActivos()

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-linear-to-r from-marca-600 to-acento-500 px-6 py-12 text-white sm:px-10">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">Vive la próxima experiencia</p>
          <h1 className="text-4xl font-bold sm:text-5xl">Encuentra tu próximo evento</h1>
          <p className="text-white/90">Descubre conciertos, festivales y eventos culturales en un solo lugar.</p>
          <div className="flex flex-wrap gap-3">
            <Link to={RUTAS.eventos} className={clasesBoton('secundario')}>Ver cartelera</Link>
            {sesion.estado !== 'autenticado' && (
              <Link to={RUTAS.registro} className={clasesBoton('fantasma', 'bg-white/10 text-white hover:bg-white/20')}>
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="eventos-destacados">
        <div className="flex items-center justify-between gap-4">
          <h2 id="eventos-destacados" className="text-2xl font-bold">Eventos destacados</h2>
          <Link to={RUTAS.eventos} className="text-sm font-semibold text-marca-600 dark:text-marca-500">Ver todos</Link>
        </div>
        {eventos.isPending && <Cargando lineas={3} />}
        {eventos.isError && <EstadoError mensaje={eventos.error.message} onReintentar={() => eventos.refetch()} />}
        {eventos.isSuccess && eventos.data.length === 0 && <EstadoVacio mensaje="Aún no hay eventos publicados" />}
        {eventos.isSuccess && eventos.data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.data.slice(0, 3).map((evento) => <TarjetaEvento key={evento.id} evento={evento} />)}
          </div>
        )}
      </section>

      <section className="space-y-5" aria-labelledby="artistas-destacados">
        <h2 id="artistas-destacados" className="text-2xl font-bold">Artistas</h2>
        {artistas.isPending && <Cargando lineas={2} />}
        {artistas.isError && <EstadoError mensaje={artistas.error.message} onReintentar={() => artistas.refetch()} />}
        {artistas.isSuccess && artistas.data.length === 0 && <EstadoVacio mensaje="Aún no hay artistas activos" />}
        {artistas.isSuccess && artistas.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artistas.data.slice(0, 6).map((artista) => (
              <Link key={artista.id} to={RUTAS.artista(artista.id)}>
                <Tarjeta className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-marca-100 text-lg font-bold text-marca-700 dark:bg-marca-600/20">
                    {artista.stageName.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold">{artista.stageName}</p>
                    <p className="text-sm text-slate-500">{artista.genre ?? 'Artista'}</p>
                  </div>
                </Tarjeta>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
