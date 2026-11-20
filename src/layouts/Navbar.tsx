import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import clsx from 'clsx'
import { clasesBoton } from '../componentes/estilos'
import { IconoCerrar, IconoLuna, IconoMenu, IconoNota, IconoSol } from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/hooks'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'
import MenuUsuario from './MenuUsuario'

interface Enlace {
  a: string
  texto: string
  roles?: Rol[] // sin roles = visible para todos
}

// Tabla 8.4 del PRD.
const ENLACES: Enlace[] = [
  { a: RUTAS.eventos, texto: 'Eventos' },
  { a: RUTAS.artistas, texto: 'Artistas' },
  { a: RUTAS.sedes, texto: 'Sedes' },
  { a: RUTAS.misTickets, texto: 'Mis tickets', roles: ['USER'] },
  { a: RUTAS.staffValidacion, texto: 'Validar ingreso', roles: ['STAFF', 'ADMIN'] },
  { a: RUTAS.adminEventos, texto: 'Administrar eventos', roles: ['ADMIN'] },
]

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
    isActive
      ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-500'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
  )

export default function Navbar() {
  const { sesion, tieneRol, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const botonMenuRef = useRef<HTMLButtonElement>(null)
  const [temaOscuro, setTemaOscuro] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', temaOscuro)
  }, [temaOscuro])

  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false)
        window.setTimeout(() => botonMenuRef.current?.focus(), 0)
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const enlaces = ENLACES.filter((e) => e.roles === undefined || tieneRol(...e.roles))

  function salir() {
    setAbierto(false)
    cerrarSesion()
    navigate(RUTAS.login, { replace: true })
  }

  const accionesAnonimo = (
    <>
      <Link to={RUTAS.login} onClick={() => setAbierto(false)} className={clasesBoton('fantasma')}>Ingresar</Link>
      <Link to={RUTAS.registro} onClick={() => setAbierto(false)} className={clasesBoton('primario')}>Registrarse</Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
        <Link to={RUTAS.inicio} className="flex items-center gap-2 font-titulo text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-marca-600 text-white">
            <IconoNota className="size-4" />
          </span>
          PulsePass
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <li key={e.a}>
              <NavLink to={e.a} className={claseEnlace}>{e.texto}</NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <button
            type="button"
            aria-label={temaOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            aria-pressed={temaOscuro}
            onClick={() => setTemaOscuro((actual) => !actual)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {temaOscuro ? <IconoSol /> : <IconoLuna />}
          </button>
          {sesion.estado === 'anonimo' && accionesAnonimo}
          {sesion.estado === 'autenticado' && <MenuUsuario usuario={sesion.usuario} onSalir={salir} />}
        </div>

        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setAbierto((v) => !v)}
          className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-lg md:hidden"
        >
          {abierto ? <IconoCerrar /> : <IconoMenu />}
        </button>
      </nav>

      {abierto && (
        <div id="menu-movil" className="space-y-1 border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          {enlaces.map((e) => (
            <NavLink key={e.a} to={e.a} onClick={() => setAbierto(false)} className={(s) => clsx(claseEnlace(s), 'block')}>
              {e.texto}
            </NavLink>
          ))}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            <button
              ref={botonMenuRef}
              type="button"
              aria-pressed={temaOscuro}
              onClick={() => setTemaOscuro((actual) => !actual)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {temaOscuro ? <IconoSol /> : <IconoLuna />}
              {temaOscuro ? 'Tema claro' : 'Tema oscuro'}
            </button>
            {sesion.estado === 'anonimo' && accionesAnonimo}
            {sesion.estado === 'autenticado' && (
              <>
                <Link to={RUTAS.cuenta} onClick={() => setAbierto(false)} className={clasesBoton('secundario')}>
                  Mi cuenta
                </Link>
                <button type="button" onClick={salir} className={clasesBoton('fantasma')}>Salir</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}