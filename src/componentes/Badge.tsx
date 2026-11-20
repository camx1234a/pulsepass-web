import type { ReactNode } from 'react'
import type { EventStatus } from '../funcionalidades/eventos/tipos'
import type { TicketStatus } from '../funcionalidades/tickets/tipos'

type Tono = 'neutro' | 'exito' | 'advertencia' | 'peligro' | 'info' | 'apagado'

const tonos: Record<Tono, string> = {
  neutro: 'bg-slate-200 text-slate-700',
  exito: 'bg-emerald-100 text-emerald-800',
  advertencia: 'bg-amber-100 text-amber-800',
  peligro: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
  apagado: 'bg-slate-300 text-slate-800',
}

const tonoPorEstado: Record<EventStatus | TicketStatus, Tono> = {
  DRAFT: 'neutro',
  PUBLISHED: 'exito',
  SOLD_OUT: 'advertencia',
  CANCELLED: 'peligro',
  FINISHED: 'apagado',
  RESERVED: 'info',
  PAID: 'exito',
  USED: 'apagado',
}

interface BadgeProps {
  tono: Tono
  children: ReactNode
}

export function Badge({ tono, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  )
}

export function BadgeEstado({ estado }: { estado: EventStatus | TicketStatus }) {
  return <Badge tono={tonoPorEstado[estado]}>{estado}</Badge>
}