import { Link, useParams } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Tarjeta from '../componentes/Tarjeta'
import Boton from '../componentes/Boton'
import { Badge, BadgeEstado } from '../componentes/Badge'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'

export default function DetalleEvento() {
  const { eventCode = '' } = useParams()
  const evento = useEvento(eventCode)
  const { sesion } = useAuth()

  if (evento.isPending) return <Cargando lineas={8} />
  if (evento.isError) {
    if (evento.error instanceof ApiError && (evento.error.status === 404 || evento.error.status === 403)) {
      return <PaginaCodigo codigo="404" mensaje="Evento no disponible." />
    }
    return <EstadoError mensaje={evento.error.message} onReintentar={() => evento.refetch()} />
  }

  const data = evento.data
  return (
    <div className="space-y-6">
      <Link to={RUTAS.eventos} className="text-sm font-semibold text-marca-600 dark:text-marca-500">← Volver a la cartelera</Link>
      <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="h-56 bg-linear-to-r from-marca-600 to-acento-500 sm:h-72" />
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px] md:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <BadgeEstado estado={data.status} />
              <Badge tono="info">{data.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">{data.name}</h1>
            <p className="text-slate-600 dark:text-slate-400">{data.description || 'Próximamente tendremos más información sobre este evento.'}</p>

            <section className="space-y-3" aria-labelledby="artistas-evento">
              <h2 id="artistas-evento" className="text-xl font-bold">Artistas</h2>
              {data.artists.length === 0 ? (
                <p className="text-sm text-slate-500">No hay artistas asociados.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.artists.map((artista) => (
                    <Link key={artista.id} to={RUTAS.artista(artista.id)}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                      {artista.stageName}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <Tarjeta className="p-5">
              <dl className="space-y-4 text-sm">
                <div><dt className="text-slate-500">Fecha y hora</dt><dd className="mt-1 font-semibold">{formatearFechaHora(data.eventDate)}</dd></div>
                <div><dt className="text-slate-500">Sede</dt><dd className="mt-1"><Link to={RUTAS.sede(data.venueCode)} className="font-semibold text-marca-600 dark:text-marca-500">{data.venueName}</Link></dd></div>
                <div><dt className="text-slate-500">Edad mínima</dt><dd className="mt-1 font-semibold">{data.minimumAge} años</dd></div>
              </dl>
            </Tarjeta>
            {sesion.estado === 'anonimo' ? (
              <Link to={RUTAS.login} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-marca-600 px-4 py-3 font-semibold text-white hover:bg-marca-700">
                Comprar entrada
              </Link>
            ) : (
              <Boton className="w-full" disabled>Compra disponible próximamente</Boton>
            )}
          </aside>
        </div>
      </article>
    </div>
  )
}
