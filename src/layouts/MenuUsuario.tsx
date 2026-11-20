import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { IconoChevron } from '../componentes/Iconos'
import type { UsuarioAutenticado } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

interface MenuUsuarioProps {
  usuario: UsuarioAutenticado
  onSalir: () => void
}

export default function MenuUsuario({ usuario, onSalir }: MenuUsuarioProps) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const idPanel = useId()
  const esUser = usuario.roles.includes('USER')

  // Cierra con Escape o al hacer clic fuera.
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    const alHacerClic = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('mousedown', alHacerClic)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('mousedown', alHacerClic)
    }
  }, [abierto])

  const claseItem =
    'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-marca-600'

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-300 py-1 pr-3 pl-1 text-sm font-medium dark:border-slate-700"
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-marca-50 text-xs font-bold text-marca-700"
        >
          {usuario.username.charAt(0).toUpperCase()}
        </span>
        {usuario.username}
        <IconoChevron className="size-4" />
      </button>

      {abierto && (
        <div
          id={idPanel}
          className="absolute right-0 z-50 mt-2 w-48 rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        >
          <Link to={RUTAS.cuenta} onClick={() => setAbierto(false)} className={claseItem}>Mi cuenta</Link>
          {esUser && (
            <Link to={RUTAS.misTickets} onClick={() => setAbierto(false)} className={claseItem}>Mis tickets</Link>
          )}
          <button type="button" onClick={onSalir} className={claseItem}>Salir</button>
        </div>
      )}
    </div>
  )
}