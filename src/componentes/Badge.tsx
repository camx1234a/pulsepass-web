import type { ReactNode } from 'react'
import type { EventStatus } from '../funcionalidades/eventos/tipos'
import type { TicketStatus } from '../funcionalidades/tickets/tipos'

type Tono = 'neutro' | 'exito' | 'advertencia' | 'peligro' | 'info' | 'apagado'

const tonos: Record<Tono, string> = {
  neutro: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  exito:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  advertencia:
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  peligro: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  apagado: 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tonos[tono]}`}
    >
      {children}
    </span>
  )
}

export function BadgeEstado({
  estado,
}: {
  estado: EventStatus | TicketStatus
}) {
  return <Badge tono={tonoPorEstado[estado]}>{estado}</Badge>
}
