import { Link, useParams } from 'react-router'
import { BadgeEstado } from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Tarjeta from '../componentes/Tarjeta'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { ApiError } from '../lib/http'
import { formatearCOP } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode = '' } = useParams()
  const ticket = useTicket(ticketCode)
  if (ticket.isPending) return <Cargando lineas={5} />
  if (ticket.isError) {
    if (ticket.error instanceof ApiError && [403, 404].includes(ticket.error.status)) return <PaginaCodigo codigo="404" mensaje="Ticket no disponible." />
    return <EstadoError mensaje={ticket.error.message} onReintentar={() => ticket.refetch()} />
  }
  return (
    <Tarjeta className="mx-auto max-w-2xl p-8 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</span>
      <h1 className="mt-5 text-3xl font-bold">¡Compra realizada con éxito!</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{ticket.data.eventName}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span className="font-mono">{ticket.data.ticketCode}</span><span>· {ticket.data.type}</span>
        <span>· {formatearCOP(ticket.data.price)}</span><BadgeEstado estado={ticket.data.status} />
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to={RUTAS.ticket(ticket.data.ticketCode)} className="inline-flex min-h-11 items-center rounded-lg bg-marca-600 px-4 font-semibold text-white">Ver mi ticket</Link>
        <Link to={RUTAS.eventos} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 font-semibold dark:border-slate-700">Seguir explorando</Link>
      </div>
    </Tarjeta>
  )
}
