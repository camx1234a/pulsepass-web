import type { ReactNode } from 'react'
import { IconoBandeja } from './Iconos'

interface EstadoVacioProps {
  mensaje: string
  accion?: ReactNode
}

export default function EstadoVacio({ mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <IconoBandeja className="size-8 text-slate-500" />
      <p className="font-semibold">{mensaje}</p>
      {accion}
    </div>
  )
}