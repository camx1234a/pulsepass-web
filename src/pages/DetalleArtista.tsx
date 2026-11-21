import { z } from 'zod'
import { Link, useParams } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import TarjetaEvento from '../componentes/TarjetaEvento'
import PaginaCodigo from '../componentes/PaginaCodigo'
import { useArtista } from '../funcionalidades/artistas/hooks'
import { useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'
import { ApiError } from '../lib/http'

const idArtistaSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().positive())

export default function DetalleArtista() {
  const { id = '' } = useParams()
  const parsed = idArtistaSchema.safeParse(id)
  const artista = useArtista(parsed.success ? parsed.data : 0)
  const stageName = artista.isSuccess ? artista.data.stageName : ''
  const eventos = useEventosPorArtista(stageName)

  if (!parsed.success)
    return <PaginaCodigo codigo="404" mensaje="No encontramos este artista." />
  if (artista.isPending) return <Cargando lineas={8} />
  if (artista.isError) {
    if (artista.error instanceof ApiError && artista.error.status === 404)
      return (
        <PaginaCodigo codigo="404" mensaje="No encontramos este artista." />
      )
    return (
      <EstadoError
        mensaje={artista.error.message}
        onReintentar={() => artista.refetch()}
      />
    )
  }

  return (
    <div className="space-y-8">
      <Link
        to={RUTAS.artistas}
        className="text-marca-600 dark:text-marca-500 text-sm font-semibold"
      >
        ← Todos los artistas
      </Link>
      <header className="flex items-center gap-5">
        <span className="bg-marca-600 relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white">
          {artista.data.stageName.slice(0, 1).toUpperCase()}
          {artista.data.imageUrl && (
            <img
              src={artista.data.imageUrl}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </span>
        <div>
          <h1 className="text-3xl font-bold">{artista.data.stageName}</h1>
          <p className="text-slate-500">
            {[artista.data.genre, artista.data.country]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </header>
      <section className="space-y-5" aria-labelledby="eventos-artista">
        <h2 id="eventos-artista" className="text-2xl font-bold">
          Eventos asociados
        </h2>
        {eventos.isPending && <Cargando lineas={4} />}
        {eventos.isError && (
          <EstadoError
            mensaje={eventos.error.message}
            onReintentar={() => eventos.refetch()}
          />
        )}
        {eventos.isSuccess && eventos.data.length === 0 && (
          <EstadoVacio mensaje="Este artista no tiene eventos publicados" />
        )}
        {eventos.isSuccess && eventos.data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.data.map((evento) => (
              <TarjetaEvento key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
