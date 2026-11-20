import { useLocation } from 'react-router'

export default function PaginaPendiente({ titulo }: { titulo: string }) {
  const ubicacion = useLocation()
  return (
    <section>
      <h1 className="text-3xl font-bold">{titulo}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Pantalla pendiente de implementar.</p>
      <p className="mt-1 font-mono text-sm">{ubicacion.pathname}</p>
    </section>
  )
}