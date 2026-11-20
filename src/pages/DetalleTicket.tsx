import { useState } from 'react'
import { Link, useParams } from 'react-router'
import AccionesTicket from '../componentes/AccionesTicket'
import Aviso from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { ApiError } from '../lib/http'
import { formatearCOP, formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import { useAvisosGlobales } from '../lib/avisos'

export default function DetalleTicket() {
  const { ticketCode = '' } = useParams()
  const ticket = useTicket(ticketCode)
  const { sesion } = useAuth()
  const [copiado, setCopiado] = useState(false)
  const [errorCopiar, setErrorCopiar] = useState<string | null>(null)
  const avisos = useAvisosGlobales()

  if (ticket.isPending) return <Cargando lineas={7} />
  if (ticket.isError) {
    if (
      ticket.error instanceof ApiError &&
      [403, 404].includes(ticket.error.status)
    ) {
      return <PaginaCodigo codigo="404" mensaje="Ticket no disponible." />
    }
    return (
      <EstadoError
        mensaje={ticket.error.message}
        onReintentar={() => ticket.refetch()}
      />
    )
  }

  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  return (
    <div className="space-y-5">
      <Link
        to={RUTAS.misTickets}
        className="text-marca-600 dark:text-marca-500 text-sm font-semibold"
      >
        ← Mis tickets
      </Link>
      <Tarjeta className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{ticket.data.eventCode}</p>
            <h1 className="mt-1 text-2xl font-bold">{ticket.data.eventName}</h1>
          </div>
          <BadgeEstado estado={ticket.data.status} />
        </div>
        <dl className="mt-6 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2 dark:border-slate-800">
          <div>
            <dt className="text-sm text-slate-500">Código</dt>
            <dd className="mt-1 flex items-center gap-2 font-mono font-semibold">
              {ticket.data.ticketCode}
              <Boton
                variante="fantasma"
                onClick={() => {
                  setErrorCopiar(null)
                  void navigator.clipboard
                    .writeText(ticket.data.ticketCode)
                    .then(() => {
                      setCopiado(true)
                      avisos.mostrar('exito', 'Código copiado.')
                    })
                    .catch(() =>
                      setErrorCopiar(
                        'No se pudo copiar. Selecciona el código para copiarlo manualmente.',
                      ),
                    )
                }}
              >
                Copiar
              </Boton>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Tipo</dt>
            <dd className="mt-1 font-semibold">{ticket.data.type}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Precio</dt>
            <dd className="mt-1 font-semibold">
              {formatearCOP(ticket.data.price)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Comprado el</dt>
            <dd className="mt-1 font-semibold">
              {formatearFechaHora(ticket.data.purchaseDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Titular</dt>
            <dd className="mt-1 font-semibold">{ticket.data.userEmail}</dd>
          </div>
        </dl>
        {copiado && (
          <Aviso tipo="exito" className="mt-5">
            Código copiado.
          </Aviso>
        )}
        {errorCopiar && (
          <Aviso tipo="error" className="mt-5">
            {errorCopiar}
          </Aviso>
        )}
        <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
          Presenta este código en el ingreso.
        </p>
        <div className="mt-5 flex justify-end">
          <AccionesTicket ticket={ticket.data} email={email} />
        </div>
      </Tarjeta>
    </div>
  )
}
