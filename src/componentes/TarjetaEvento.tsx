import { Link } from 'react-router'
import { BadgeEstado } from './Badge'
import Tarjeta from './Tarjeta'
import { RUTAS } from '../lib/rutas'
import { formatearFechaHora } from '../lib/formato'
import type { EventoResumen } from '../funcionalidades/eventos/tipos'

export default function TarjetaEvento({ evento }: { evento: EventoResumen }) {
  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600"
    >
      <Tarjeta className="h-full overflow-hidden transition-transform group-hover:-translate-y-1">
        <div className="h-36 bg-linear-to-r from-marca-600 to-acento-500" />
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold">{evento.name}</h3>
            <BadgeEstado estado={evento.status} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {formatearFechaHora(evento.eventDate)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{evento.venueName}</p>
          <span className="inline-block text-sm font-semibold text-marca-600 dark:text-marca-500">
            Ver evento →
          </span>
        </div>
      </Tarjeta>
    </Link>
  )
}
