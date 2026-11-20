import { Link } from 'react-router'
import { BadgeEstado } from './Badge'
import Tarjeta from './Tarjeta'
import { RUTAS } from '../lib/rutas'
import { formatearFechaHora } from '../lib/formato'
import type { EventoResumen } from '../funcionalidades/eventos/tipos'
import { nombreCategoria } from '../funcionalidades/eventos/formato'

function imagenEvento(categoria: EventoResumen['category']): string {
  if (categoria === 'MUSIC') return '/images/event-music.jpg'
  if (categoria === 'SPORTS') return '/images/event-sports.jpg'
  if (categoria === 'TECHNOLOGY' || categoria === 'EDUCATION') return '/images/event-tech.jpg'
  return '/images/event-culture.jpg'
}

export default function TarjetaEvento({ evento }: { evento: EventoResumen }) {
  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600"
    >
      <Tarjeta className="h-full overflow-hidden transition-transform group-hover:-translate-y-1">
        <div className="relative h-44 overflow-hidden bg-slate-900">
          <img
            src={evento.imageUrl?.trim() || imagenEvento(evento.category)}
            alt=""
            onError={(event) => { event.currentTarget.src = imagenEvento(evento.category) }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
