interface CargandoProps {
  lineas?: number
}

export default function Cargando({ lineas = 3 }: CargandoProps) {
  return (
    <div role="status" aria-busy="true" className="animate-pulse space-y-3">
      <span className="sr-only">Cargando…</span>
      <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
      {Array.from({ length: lineas }, (_, i) => (
        <div key={i} className="h-3 rounded bg-slate-200 dark:bg-slate-800" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  )
}