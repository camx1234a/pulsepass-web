import Modal from '../componentes/Modal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import PaginaCodigo from '../componentes/PaginaCodigo'
import Selector from '../componentes/Selector'
import Tarjeta from '../componentes/Tarjeta'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import {
  useAsociarArtista,
  useEvento,
  usePublicarEvento,
} from '../funcionalidades/eventos/hooks'
import { ApiError } from '../lib/http'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import { useAvisosGlobales } from '../lib/avisos'

const formularioSchema = z.object({
  artistaId: z.string().regex(/^[1-9]\d*$/, 'Selecciona un artista.'),
})

export default function AdminGestionEvento() {
  const { eventCode = '' } = useParams()
  const evento = useEvento(eventCode)
  const artistas = useArtistasActivos()
  const publicar = usePublicarEvento()
  const asociar = useAsociarArtista()
  const form = useForm({
    resolver: zodResolver(formularioSchema),
    defaultValues: { artistaId: '' },
  })
  const [confirmar, setConfirmar] = useState(false)
  const avisos = useAvisosGlobales()

  if (evento.isPending) return <Cargando lineas={7} />
  if (evento.isError) {
    if (
      evento.error instanceof ApiError &&
      [403, 404].includes(evento.error.status)
    )
      return (
        <PaginaCodigo
          codigo={evento.error.status === 403 ? '403' : '404'}
          mensaje="No encontramos un evento disponible para gestionar."
        />
      )
    return (
      <EstadoError
        mensaje={evento.error.message}
        onReintentar={() => evento.refetch()}
      />
    )
  }
  const data = evento.data
  const asociados = new Set(data.artists.map((artista) => artista.id))
  const disponibles = artistas.isSuccess
    ? artistas.data.filter((artista) => !asociados.has(artista.id))
    : []

  return (
    <div className="space-y-6">
      <Link
        to={RUTAS.adminEventos}
        className="text-marca-600 text-sm font-semibold"
      >
        ← Eventos
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.eventCode} · {data.category} ·{' '}
            {formatearFechaHora(data.eventDate)} · Mín. {data.minimumAge} años
          </p>
        </div>
        <BadgeEstado estado={data.status} />
      </header>
      {(publicar.isError || asociar.isError) && (
        <Aviso tipo="error">
          {publicar.error?.message ?? asociar.error?.message}
        </Aviso>
      )}
      {publicar.isSuccess && <Aviso tipo="exito">Evento publicado.</Aviso>}
      {asociar.isSuccess && <Aviso tipo="exito">Artista asociado.</Aviso>}
      <Tarjeta className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-bold">Publicación</h2>
          <p className="text-sm text-slate-500">
            El evento será visible en la cartelera pública una vez publicado.
          </p>
        </div>
        <Boton
          disabled={data.status !== 'DRAFT'}
          onClick={() => setConfirmar(true)}
        >
          Publicar evento
        </Boton>
      </Tarjeta>
      <Tarjeta className="space-y-4 p-5">
        <h2 className="text-xl font-bold">Artistas asociados</h2>
        {data.artists.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay artistas asociados.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {data.artists.map((artista) => (
              <li
                key={artista.id}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800"
              >
                {artista.stageName}
              </li>
            ))}
          </ul>
        )}
        {artistas.isError && (
          <Aviso tipo="error">{artistas.error.message}</Aviso>
        )}
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={form.handleSubmit(({ artistaId }) =>
            asociar.mutate(
              { eventCode, artistId: Number(artistaId) },
              { onSuccess: () => form.reset() },
            ),
          )}
        >
          <div className="flex-1">
            <Selector
              etiqueta="Agregar artista"
              {...form.register('artistaId')}
              error={form.formState.errors.artistaId?.message}
              disabled={!artistas.isSuccess || disponibles.length === 0}
            >
              <option value="">Selecciona un artista</option>
              {disponibles.map((artista) => (
                <option key={artista.id} value={artista.id}>
                  {artista.stageName}
                </option>
              ))}
            </Selector>
          </div>
          <Boton
            type="submit"
            cargando={asociar.isPending}
            disabled={disponibles.length === 0}
          >
            Asociar
          </Boton>
        </form>
      </Tarjeta>
      <Link
        to={RUTAS.staffTicketsPagados(data.eventCode)}
        className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"
      >
        Ver tickets pagados →
      </Link>

      <Modal
        abierto={confirmar}
        titulo="¿Publicar el evento?"
        onCerrar={() => setConfirmar(false)}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          El evento quedará visible para el público.
        </p>
        {publicar.isError && (
          <Aviso tipo="error">{publicar.error.message}</Aviso>
        )}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={() => setConfirmar(false)}>
            Cancelar
          </Boton>
          <Boton
            cargando={publicar.isPending}
            onClick={() =>
              publicar.mutate(eventCode, {
                onSuccess: () => {
                  avisos.mostrar('exito', 'Evento publicado.')
                  setConfirmar(false)
                },
              })
            }
          >
            Confirmar publicación
          </Boton>
        </div>
      </Modal>
    </div>
  )
}
