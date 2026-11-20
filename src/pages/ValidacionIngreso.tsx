import { useState } from 'react'
import Aviso from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import Tarjeta from '../componentes/Tarjeta'
import { useTicket, useUsarTicket } from '../funcionalidades/tickets/hooks'
import { ApiError } from '../lib/http'
import { formatearCOP, formatearFechaHora } from '../lib/formato'

export default function ValidacionIngreso() {
  const [codigo, setCodigo] = useState('')
  const [buscado, setBuscado] = useState('')
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null)
  const ticket = useTicket(buscado)
  const usar = useUsarTicket()

  function buscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const limpio = codigo.trim()
    if (!/^TCK-[A-Za-z0-9-]+$/i.test(limpio)) {
      setErrorCodigo('Ingresa un código válido que empiece por TCK-.')
      return
    }
    setErrorCodigo(null)
    setBuscado(limpio)
    usar.reset()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header><p className="text-sm font-semibold text-marca-600 dark:text-marca-500">Acceso de asistentes</p><h1 className="mt-1 text-3xl font-bold">Validación de ingreso</h1></header>
      <form onSubmit={buscar} className="flex flex-col gap-3 rounded-xl bg-white p-5 ring-1 ring-slate-200 sm:flex-row sm:items-end dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex-1"><Campo etiqueta="Código de ticket" autoComplete="off" autoFocus placeholder="TCK-8F2A1C" value={codigo} onChange={(e) => setCodigo(e.target.value)} error={errorCodigo ?? undefined} /></div>
        <Boton type="submit" cargando={ticket.isFetching}>Buscar ticket</Boton>
      </form>

      {buscado && ticket.isFetching && <Cargando lineas={4} />}
      {ticket.isError && <EstadoError mensaje={ticket.error instanceof ApiError && ticket.error.status === 404 ? 'Ticket no encontrado.' : ticket.error.message} onReintentar={() => ticket.refetch()} />}
      {usar.isError && <Aviso tipo={usar.error instanceof ApiError && usar.error.status === 409 ? 'advertencia' : 'error'}>{usar.error.message}</Aviso>}
      {usar.isSuccess && <Aviso tipo="exito">Ingreso registrado correctamente.</Aviso>}

      {ticket.isSuccess && (
        <Tarjeta className="space-y-5 border-l-4 border-l-marca-600 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-mono text-sm text-slate-500">{ticket.data.ticketCode}</p><h2 className="mt-1 text-2xl font-bold">{ticket.data.eventName}</h2></div>
            <BadgeEstado estado={usar.isSuccess ? usar.data.status : ticket.data.status} />
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div><dt className="text-sm text-slate-500">Titular</dt><dd className="mt-1 font-semibold">{ticket.data.userEmail}</dd></div>
            <div><dt className="text-sm text-slate-500">Entrada</dt><dd className="mt-1 font-semibold">{ticket.data.type}</dd></div>
            <div><dt className="text-sm text-slate-500">Precio</dt><dd className="mt-1 font-semibold">{formatearCOP(ticket.data.price)}</dd></div>
            <div><dt className="text-sm text-slate-500">Compra</dt><dd className="mt-1 font-semibold">{formatearFechaHora(ticket.data.purchaseDate)}</dd></div>
          </dl>
          {ticket.data.status === 'PAID' && !usar.isSuccess && (
            <div className="flex justify-end"><Boton cargando={usar.isPending} onClick={() => usar.mutate(ticket.data.ticketCode)}>Marcar como usado</Boton></div>
          )}
        </Tarjeta>
      )}
    </div>
  )
}
