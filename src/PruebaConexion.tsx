// TEMPORAL: comprueba proxy + zod + login -> /me -> by-username. Bórralo al montar el router.
import { useState, type SyntheticEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarEventosPublicados } from './funcionalidades/eventos/api'
import { useAuth } from './funcionalidades/auth/hooks'
import { ApiError } from './lib/http'
import { formatearFecha } from './lib/formato'
import Aviso from './componentes/Aviso'
import Boton from './componentes/Boton'

export default function PruebaConexion() {
  const { sesion, iniciarSesion, cerrarSesion } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargandoPrueba, setCargandoPrueba] = useState(false)

  const eventos = useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: ({ signal }) => listarEventosPublicados(signal),
    staleTime: 60_000,
  })

  async function alEnviar(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    try {
      await iniciarSesion(identifier, password)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? `${err.status}: ${err.message}` : 'Error desconocido')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <h1 className="text-3xl font-bold text-marca-600">PulsePass · prueba de conexión</h1>

      <section aria-labelledby="t-eventos" className="space-y-2">
        <h2 id="t-eventos" className="text-xl font-semibold">Eventos publicados</h2>
        {eventos.isPending && <p>Cargando...</p>}
        {eventos.isError && <p role="alert" className="text-red-700">{eventos.error.message}</p>}
        {eventos.isSuccess && eventos.data.length === 0 && <p>Aún no hay eventos publicados.</p>}
        {eventos.isSuccess && (
          <ul className="list-disc pl-5">
            {eventos.data.map((ev) => (
              <li key={ev.eventCode}>
                <span className="font-mono">{ev.eventCode}</span> · {ev.name} · {formatearFecha(ev.eventDate)} ·{' '}
                {ev.venueName} · {ev.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="t-sesion" className="space-y-3">
        <h2 id="t-sesion" className="text-xl font-semibold">Sesión</h2>
        {sesion.estado === 'cargando' && <p>Restaurando sesión...</p>}
        {sesion.estado === 'autenticado' && (
          <div className="space-y-2">
            <p>
              {sesion.usuario.username} · {sesion.usuario.email} · roles: {sesion.usuario.roles.join(', ')}
            </p>
            <button className="rounded-lg bg-slate-200 px-4 py-2 dark:bg-slate-800" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        )}
        {sesion.estado === 'anonimo' && (
          <form onSubmit={alEnviar} className="space-y-3">
            {sesion.motivo === 'expirada' && <p role="status">Tu sesión expiró. Inicia sesión de nuevo.</p>}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium">Usuario o correo</label>
              <input
                id="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
              />
            </div>
            {error !== null && <p role="alert" className="text-red-700">{error}</p>}
            <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 font-semibold text-white hover:bg-marca-700">
              Ingresar
            </button>
          </form>
        )}
      </section>

      <section aria-labelledby="t-componentes" className="space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h2 id="t-componentes" className="text-xl font-semibold">Prueba rápida de componentes</h2>
        <div className="max-w-lg space-y-2">
          <Aviso tipo="info">Aviso informativo de prueba.</Aviso>
          <Aviso tipo="exito">Operación completada correctamente.</Aviso>
          <Aviso tipo="advertencia">Revisa los datos antes de continuar.</Aviso>
          <Aviso tipo="error">Ejemplo de mensaje de error.</Aviso>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Boton
            variante="primario"
            cargando={cargandoPrueba}
            onClick={() => {
              setCargandoPrueba(true)
              setTimeout(() => setCargandoPrueba(false), 800)
            }}
          >
            Probar botón
          </Boton>
        </div>
      </section>
    </div>
  )
}