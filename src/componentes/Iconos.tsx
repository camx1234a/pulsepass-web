import type { ComponentProps } from 'react'

function Icono({ children, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoMenu = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icono>
)
export const IconoCerrar = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="M18 6 6 18M6 6l12 12" /></Icono>
)
export const IconoAdvertencia = (p: ComponentProps<'svg'>) => (
  <Icono {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01" />
  </Icono>
)
export const IconoCheck = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="M20 6 9 17l-5-5" /></Icono>
)
export const IconoInfo = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></Icono>
)
export const IconoNota = (p: ComponentProps<'svg'>) => (
  <Icono {...p}>
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </Icono>
)
export const IconoSol = (p: ComponentProps<'svg'>) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
  </Icono>
)
export const IconoLuna = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></Icono>
)
export const IconoChevron = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="m6 9 6 6 6-6" /></Icono>
)
export const IconoBandeja = (p: ComponentProps<'svg'>) => (
  <Icono {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icono>
)