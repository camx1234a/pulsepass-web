import type { EventCategory } from '../funcionalidades/eventos/tipos'
import {
  IconoCultura,
  IconoDeporte,
  IconoEducacion,
  IconoEntretenimiento,
  IconoMusica,
  IconoTecnologia,
} from './Iconos'

const estilosCategoria: Record<EventCategory, { fondo: string; icono: typeof IconoMusica }> = {
  MUSIC: { fondo: 'bg-linear-to-br from-violet-700 via-fuchsia-600 to-rose-500', icono: IconoMusica },
  SPORTS: { fondo: 'bg-linear-to-br from-emerald-700 via-teal-600 to-cyan-500', icono: IconoDeporte },
  TECHNOLOGY: { fondo: 'bg-linear-to-br from-slate-900 via-blue-700 to-cyan-500', icono: IconoTecnologia },
  EDUCATION: { fondo: 'bg-linear-to-br from-amber-700 via-orange-500 to-yellow-400', icono: IconoEducacion },
  CULTURE: { fondo: 'bg-linear-to-br from-rose-800 via-pink-600 to-orange-400', icono: IconoCultura },
  ENTERTAINMENT: { fondo: 'bg-linear-to-br from-indigo-800 via-purple-600 to-pink-500', icono: IconoEntretenimiento },
}

export default function VisualEvento({
  categoria,
  className = '',
}: {
  categoria: EventCategory
  className?: string
}) {
  const estilo = estilosCategoria[categoria]
  const IconoCategoria = estilo.icono
  return (
    <div aria-hidden="true" className={`flex items-center justify-center text-white ${estilo.fondo} ${className}`}>
      <IconoCategoria className="size-16 drop-shadow-md" />
    </div>
  )
}
