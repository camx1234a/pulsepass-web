import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 text-xs text-slate-600 dark:text-slate-400">
        <p>© {new Date().getFullYear()} PulsePass · Caso de estudio académico</p>
        <nav aria-label="Secundaria" className="flex gap-3">
          <Link to={RUTAS.sedes}>Sedes</Link>
          <Link to={RUTAS.artistas}>Artistas</Link>
        </nav>
      </div>
    </footer>
  )
}