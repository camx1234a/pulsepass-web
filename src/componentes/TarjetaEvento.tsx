import { Link } from 'react-router'
import { BadgeEstado } from './Badge'
import Tarjeta from './Tarjeta'
import { RUTAS } from '../lib/rutas'
import { formatearFechaHora } from '../lib/formato'
import type { EventoResumen } from '../funcionalidades/eventos/tipos'
import { nombreCategoria } from '../funcionalidades/eventos/formato'
import VisualEvento from './VisualEvento'

export default function TarjetaEvento({ evento }: { evento: EventoResumen }) {
  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group focus-visible:outline-marca-600 block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <Tarjeta className="h-full overflow-hidden transition-transform group-hover:-translate-y-1">
        <div className="relative h-44 overflow-hidden">
          <VisualEvento
            categoria={evento.category}
            className="h-full transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {nombreCategoria(evento.category)}
          </span>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold">{evento.name}</h3>
            <BadgeEstado estado={evento.status} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Código:{' '}
            <span className="font-mono wrap-anywhere">{evento.eventCode}</span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {formatearFechaHora(evento.eventDate)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {evento.venueName}
          </p>
          <span className="text-marca-600 dark:text-marca-500 inline-block text-sm font-semibold">
            Ver evento →
          </span>
        </div>
      </Tarjeta>
    </Link>
  )
}
