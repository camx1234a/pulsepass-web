import type { ComponentProps, ComponentType, ReactNode } from 'react'
import clsx from 'clsx'
import { IconoAdvertencia, IconoCheck, IconoCerrar, IconoInfo } from './Iconos'

export type TipoAviso = 'exito' | 'error' | 'info' | 'advertencia'

const estilos: Record<TipoAviso, string> = {
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-marca-500/30 bg-marca-50 text-marca-700',
  advertencia: 'border-amber-200 bg-amber-50 text-amber-800',
}

const iconos: Record<TipoAviso, ComponentType<ComponentProps<'svg'>>> = {
  exito: IconoCheck,
  error: IconoAdvertencia,
  info: IconoInfo,
  advertencia: IconoAdvertencia,
}

interface AvisoProps {
  tipo: TipoAviso
  children: ReactNode
  onCerrar?: () => void
  className?: string
}

export default function Aviso({ tipo, children, onCerrar, className }: AvisoProps) {
  const Icono = iconos[tipo]
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={clsx('flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', estilos[tipo], className)}
    >
      <Icono className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onCerrar && (
        <button type="button" onClick={onCerrar} aria-label="Cerrar aviso" className="shrink-0 rounded p-0.5">
          <IconoCerrar className="size-4" />
        </button>
      )}
    </div>
  )
}