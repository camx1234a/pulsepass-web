import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import AccionesTicket from '../componentes/AccionesTicket'
import { BadgeEstado } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useMisTickets } from '../funcionalidades/tickets/hooks'
import type { TicketStatus } from '../funcionalidades/tickets/tipos'
import { formatearCOP, formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function MisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const tickets = useMisTickets(email)
  const [estado, setEstado] = useState<'TODOS' | TicketStatus>('TODOS')
  const filtrados = useMemo(
    () =>
      tickets.data?.filter(
        (ticket) => estado === 'TODOS' || ticket.status === estado,
      ) ?? [],
    [tickets.data, estado],
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-marca-600 dark:text-marca-500 text-sm font-semibold">
            Tu historial de entradas
          </p>
          <h1 className="mt-1 text-3xl font-bold">Mis tickets</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['TODOS', 'PAID', 'USED', 'CANCELLED', 'RESERVED'] as const).map(
            (opcion) => (
              <Boton
                key={opcion}
                variante={estado === opcion ? 'primario' : 'secundario'}
                aria-pressed={estado === opcion}
                onClick={() => setEstado(opcion)}
              >
                {opcion === 'TODOS' ? 'Todos' : opcion}
              </Boton>
            ),
          )}
        </div>
      </header>
      {tickets.isPending && <Cargando lineas={5} />}
      {tickets.isError && (
        <EstadoError
          mensaje={tickets.error.message}
          onReintentar={() => tickets.refetch()}
        />
      )}
      {tickets.isSuccess && filtrados.length === 0 && (
        <EstadoVacio
          mensaje={
            tickets.data.length === 0
              ? 'Aún no tienes tickets'
              : 'No hay tickets con este estado'
          }
          accion={
            tickets.data.length === 0 ? (
              <Link to={RUTAS.eventos} className="text-marca-600 font-semibold">
                Explorar eventos
              </Link>
            ) : undefined
          }
        />
      )}
      {tickets.isSuccess && filtrados.length > 0 && (
        <ul className="space-y-4">
          {filtrados.map((ticket) => (
            <li
              key={ticket.ticketCode}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to={RUTAS.evento(ticket.eventCode)}
                    className="hover:text-marca-600 text-lg font-bold"
                  >
                    {ticket.eventName}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.ticketCode} · {ticket.type} ·{' '}
                    {formatearCOP(ticket.price)} ·{' '}
                    {formatearFechaHora(ticket.purchaseDate)}
                  </p>
                </div>
                <BadgeEstado estado={ticket.status} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Link
                  to={RUTAS.ticket(ticket.ticketCode)}
                  className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"
                >
                  Ver detalle
                </Link>
                <AccionesTicket ticket={ticket} email={email} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
