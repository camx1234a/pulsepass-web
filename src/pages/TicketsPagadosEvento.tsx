import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Campo from '../componentes/Campo'
import Tabla from '../componentes/Tabla'
import {
  useTicketsPagadosPorEvento,
  useUsarTicket,
} from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import { formatearCOP } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import { useAvisosGlobales } from '../lib/avisos'

const formularioSchema = z.object({
  codigo: z.string().trim().min(1, 'Ingresa el código del evento.'),
})

export default function TicketsPagadosEvento() {
  const { eventCode = '' } = useParams()
  const form = useForm({
    resolver: zodResolver(formularioSchema),
    values: { codigo: eventCode },
  })
  const eventCodeActivo = eventCode
  const navigate = useNavigate()
  const tickets = useTicketsPagadosPorEvento(eventCodeActivo)
  const usar = useUsarTicket()
  const avisos = useAvisosGlobales()

  const columnas = [
    {
      encabezado: 'Código',
      celda: (ticket: Ticket) => (
        <span className="font-mono">{ticket.ticketCode}</span>
      ),
    },
    { encabezado: 'Tipo', celda: (ticket: Ticket) => ticket.type },
    { encabezado: 'Titular', celda: (ticket: Ticket) => ticket.userEmail },
    {
      encabezado: 'Precio',
      celda: (ticket: Ticket) => formatearCOP(ticket.price),
    },
    {
      encabezado: 'Estado',
      celda: (ticket: Ticket) => <BadgeEstado estado={ticket.status} />,
    },
    {
      encabezado: 'Acción',
      celda: (ticket: Ticket) =>
        ticket.status === 'PAID' ? (
          <Boton
            cargando={usar.isPending && usar.variables === ticket.ticketCode}
            onClick={() =>
              usar.mutate(ticket.ticketCode, {
                onSuccess: () =>
                  avisos.mostrar('exito', 'Ticket marcado como usado.'),
              })
            }
          >
            Usar
          </Boton>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <p className="text-marca-600 dark:text-marca-500 text-sm font-semibold">
          Control de acceso
        </p>
        <h1 className="mt-1 text-3xl font-bold">Tickets pagados</h1>
      </header>
      <form
        onSubmit={form.handleSubmit(({ codigo }) =>
          navigate(RUTAS.staffTicketsPagados(codigo)),
        )}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Campo
            etiqueta="Código del evento"
            {...form.register('codigo')}
            error={form.formState.errors.codigo?.message}
            placeholder="CMF-2026"
          />
        </div>
        <Boton type="submit">Consultar evento</Boton>
      </form>
      {eventCodeActivo && tickets.isPending && <Cargando lineas={5} />}
      {tickets.isError && (
        <EstadoError
          mensaje={
            tickets.error instanceof ApiError && tickets.error.status === 404
              ? 'No encontramos este evento.'
              : tickets.error.message
          }
          onReintentar={() => tickets.refetch()}
        />
      )}
      {usar.isError && <Aviso tipo="error">{usar.error.message}</Aviso>}
      {usar.isSuccess && <Aviso tipo="exito">Ticket marcado como usado.</Aviso>}
      {tickets.isSuccess && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Evento: {eventCodeActivo}</h2>
            <span className="text-sm text-slate-500">
              Total: {tickets.data.length}
            </span>
          </div>
          {tickets.data.length === 0 ? (
            <EstadoVacio mensaje="No hay tickets pagados para este evento" />
          ) : (
            <div className="hidden md:block">
              <Tabla
                columnas={columnas}
                filas={tickets.data}
                clave={(ticket) => ticket.ticketCode}
                descripcion={`Tickets pagados del evento ${eventCodeActivo}`}
              />
            </div>
          )}
          <ul className="space-y-3 md:hidden">
            {tickets.data.map((ticket) => (
              <li
                key={ticket.ticketCode}
                className="rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-mono">{ticket.ticketCode}</span>
                  <BadgeEstado estado={ticket.status} />
                </div>
                <p className="mt-2">
                  {ticket.type} · {formatearCOP(ticket.price)}
                </p>
                <p className="text-sm text-slate-500">{ticket.userEmail}</p>
                {ticket.status === 'PAID' && (
                  <Boton
                    className="mt-3 w-full"
                    cargando={
                      usar.isPending && usar.variables === ticket.ticketCode
                    }
                    onClick={() =>
                      usar.mutate(ticket.ticketCode, {
                        onSuccess: () =>
                          avisos.mostrar('exito', 'Ticket marcado como usado.'),
                      })
                    }
                  >
                    Marcar como usado
                  </Boton>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
