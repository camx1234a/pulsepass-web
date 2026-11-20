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

export const IconoMusica = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="M9 18V5l10-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="15" r="3" /></Icono>
)
export const IconoDeporte = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><circle cx="12" cy="12" r="9" /><path d="M5.4 8.5h13.2M5.4 15.5h13.2M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" /></Icono>
)
export const IconoTecnologia = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Icono>
)
export const IconoEducacion = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.5v4.2c2.8 2.1 7.2 2.1 10 0v-4.2" /></Icono>
)
export const IconoCultura = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.6 5.6c3.5 3.5 9.3 3.5 12.8 0M5.6 18.4c3.5-3.5 9.3-3.5 12.8 0" /></Icono>
)
export const IconoEntretenimiento = (p: ComponentProps<'svg'>) => (
  <Icono {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></Icono>
)