import { Link, useNavigate } from 'react-router'
import { Badge } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { RUTAS } from '../lib/rutas'
import { formatearFecha } from '../lib/formato'

export default function Cuenta() {
  const { sesion, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const perfil = useUsuarioPorEmail(
    sesion.estado === 'autenticado' ? sesion.usuario.email : '',
  )
  if (sesion.estado !== 'autenticado') return <Cargando />

  function salir() {
    cerrarSesion()
    navigate(RUTAS.login, { replace: true })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mi cuenta</h1>
      {perfil.isPending && <Cargando lineas={5} />}
      {perfil.isError && (
        <EstadoError
          mensaje={perfil.error.message}
          onReintentar={() => perfil.refetch()}
        />
      )}
      {perfil.isSuccess && (
        <>
          <Tarjeta className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="bg-marca-600 flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white">
                {perfil.data.firstName.slice(0, 1).toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {perfil.data.firstName} {perfil.data.lastName}
                  </h2>
                  {sesion.usuario.roles.map((rol) => (
                    <Badge key={rol} tono="info">
                      Rol: {rol}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  @{perfil.data.username} · {perfil.data.email}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Nacimiento: {formatearFecha(perfil.data.birthDate)}
                </p>
              </div>
              <Badge tono={perfil.data.active ? 'exito' : 'apagado'}>
                {perfil.data.active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </Tarjeta>
          <div className="flex flex-wrap justify-between gap-3">
            {sesion.usuario.roles.includes('USER') && (
              <Link
                to={RUTAS.misTickets}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700"
              >
                Ver mis tickets
              </Link>
            )}
            <Boton variante="secundario" onClick={salir}>
              Cerrar sesión
            </Boton>
          </div>
        </>
      )}
    </div>
  )
}
