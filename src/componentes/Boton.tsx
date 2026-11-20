import type { ComponentProps } from 'react'
import { clasesBoton, type VarianteBoton } from './estilos'

interface BotonProps extends ComponentProps<'button'> {
  variante?: VarianteBoton
  cargando?: boolean
}

export default function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  className,
  children,
  type = 'button',
  ...resto
}: BotonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={clasesBoton(variante, className)}
      {...resto}
    >
      {cargando ? 'Cargando…' : children}
    </button>
  )
}
