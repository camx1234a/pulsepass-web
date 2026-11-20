import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Tarjeta from '../componentes/Tarjeta'
import Boton from '../componentes/Boton'
import { Badge, BadgeEstado } from '../componentes/Badge'
import Aviso from '../componentes/Aviso'
import Modal from '../componentes/Modal'
import Selector from '../componentes/Selector'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { TicketTypeSchema } from '../funcionalidades/tickets/tipos'
import { useComprarTicket } from '../funcionalidades/tickets/hooks'
import { RUTAS } from '../lib/rutas'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'
import { nombreCategoria } from '../funcionalidades/eventos/formato'
import VisualEvento from '../componentes/VisualEvento'

export default function DetalleEvento() {
  const { eventCode = '' } = useParams()
  const evento = useEvento(eventCode)
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipo, setTipo] = useState<(typeof TicketTypeSchema.options)[number]>('GENERAL')
  const compra = useComprarTicket(sesion.estado === 'autenticado' ? sesion.usuario.email : '')

  if (evento.isPending) return <Cargando lineas={8} />
  if (evento.isError) {
    if (evento.error instanceof ApiError && (evento.error.status === 404 || evento.error.status === 403)) {
      return <PaginaCodigo codigo="404" mensaje="Evento no disponible." />
    }
    return <EstadoError mensaje={evento.error.message} onReintentar={() => evento.refetch()} />
  }

  const data = evento.data
  const compraHabilitada = data.status === 'PUBLISHED'
  const puedeComprar = sesion.estado === 'anonimo' ||
    (sesion.estado === 'autenticado' && sesion.usuario.roles.includes('USER'))
  return (
    <div className="space-y-6">
      <Link to={RUTAS.eventos} className="text-sm font-semibold text-marca-600 dark:text-marca-500">← Volver a la cartelera</Link>
      <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="h-56 overflow-hidden sm:h-72">
          <VisualEvento categoria={data.category} className="h-full" />
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px] md:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <BadgeEstado estado={data.status} />
              <Badge tono="info">{nombreCategoria(data.category)}</Badge>
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
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pr-3 pl-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-marca-600 text-xs font-bold text-white">
                        {artista.stageName.slice(0, 1).toUpperCase()}
                        {artista.imageUrl && (
                          <img
                            src={artista.imageUrl}
                            alt=""
                            onError={(event) => { event.currentTarget.style.display = 'none' }}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </span>
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
            {compraHabilitada && puedeComprar && sesion.estado === 'anonimo' && (
              <Link to={RUTAS.login} state={{ desde: RUTAS.evento(eventCode) }} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-marca-600 px-4 py-3 font-semibold text-white hover:bg-marca-700">
                Comprar entrada
              </Link>
            )}
            {compraHabilitada && puedeComprar && sesion.estado === 'autenticado' && (
              <Boton className="w-full" onClick={() => setModalAbierto(true)}>Comprar entrada</Boton>
            )}
          </aside>
        </div>
      </article>
      <Modal abierto={modalAbierto} titulo="Comprar entrada" onCerrar={() => setModalAbierto(false)}>
        <p className="text-sm text-slate-600 dark:text-slate-400">{data.name}. El precio final lo determina el servidor.</p>
        <Selector etiqueta="Tipo de entrada" value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
          {TicketTypeSchema.options.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
        </Selector>
        {compra.isError && <Aviso tipo="error">{compra.error.message}</Aviso>}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={() => setModalAbierto(false)}>Volver</Boton>
          <Boton
            cargando={compra.isPending}
            onClick={() => {
              if (sesion.estado !== 'autenticado' || !sesion.usuario.roles.includes('USER')) {
                navigate(RUTAS.sinPermisos)
                return
              }
              compra.mutate(
                { userEmail: sesion.usuario.email, eventCode, type: tipo },
                { onSuccess: (ticket) => navigate(RUTAS.confirmacionCompra(ticket.ticketCode)) },
              )
            }}
          >
            Confirmar compra
          </Boton>
        </div>
      </Modal>
    </div>
  )
}
