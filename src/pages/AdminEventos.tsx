import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { BadgeEstado } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Tarjeta from '../componentes/Tarjeta'
import {
  useEventosCreadosEnSesion,
  useEvento,
} from '../funcionalidades/eventos/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function AdminEventos() {
  const [codigo, setCodigo] = useState('')
  const [buscado, setBuscado] = useState('')
  const navigate = useNavigate()
  const evento = useEvento(buscado)
  const creados = useEventosCreadosEnSesion()

  function buscar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBuscado(codigo.trim())
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-marca-600 dark:text-marca-500 text-sm font-semibold">
            Panel de control
          </p>
          <h1 className="mt-1 text-3xl font-bold">Administración de eventos</h1>
        </div>
        <Link
          to={RUTAS.adminNuevoEvento}
          className="bg-marca-600 inline-flex min-h-11 items-center rounded-lg px-4 font-semibold text-white"
        >
          + Nuevo evento
        </Link>
      </header>
      <Tarjeta className="space-y-4 p-5">
        <h2 className="text-lg font-bold">Buscar evento por código</h2>
        <form
          onSubmit={buscar}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Campo
              etiqueta="Código del evento"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="CMF-2026"
            />
          </div>
          <Boton type="submit" disabled={!codigo.trim()}>
            Abrir evento
          </Boton>
        </form>
        {buscado && evento.isPending && <Cargando lineas={2} />}
        {buscado && evento.isError && (
          <EstadoError
            mensaje={
              evento.error instanceof ApiError && evento.error.status === 404
                ? 'No encontramos un evento con ese código.'
                : evento.error.message
            }
            onReintentar={() => evento.refetch()}
          />
        )}
        {evento.isSuccess && buscado && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <div>
              <p className="font-semibold">
                {evento.data.eventCode} · {evento.data.name}
              </p>
              <p className="text-sm text-slate-500">{evento.data.venueName}</p>
            </div>
            <div className="flex items-center gap-3">
              <BadgeEstado estado={evento.data.status} />
              <Boton
                onClick={() =>
                  navigate(RUTAS.adminEvento(evento.data.eventCode))
                }
              >
                Gestionar
              </Boton>
            </div>
          </div>
        )}
      </Tarjeta>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Eventos creados en esta sesión</h2>
          <p className="text-sm text-slate-500">
            El backend no ofrece un listado completo; aquí aparecen los creados
            mientras esta pestaña sigue abierta.
          </p>
        </div>
        {creados.data.length === 0 ? (
          <EstadoVacio mensaje="Aún no has creado eventos en esta sesión" />
        ) : (
          <ul className="space-y-3">
            {creados.data.map((item) => (
              <li key={item.eventCode}>
                <Tarjeta className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <span>
                    <strong>{item.eventCode}</strong> · {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <BadgeEstado estado={item.status} />
                    <Link
                      to={RUTAS.adminEvento(item.eventCode)}
                      className="text-marca-600 font-semibold"
                    >
                      Gestionar
                    </Link>
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
