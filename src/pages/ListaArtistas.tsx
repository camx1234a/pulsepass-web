import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { ApiError } from '../lib/http'
import { Link } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Tarjeta from '../componentes/Tarjeta'
import {
  useArtistaPorNombre,
  useArtistasActivos,
} from '../funcionalidades/artistas/hooks'
import { RUTAS } from '../lib/rutas'

const formularioSchema = z.object({
  nombre: z.string().trim().min(1, 'Ingresa el nombre artístico.'),
})

export default function ListaArtistas() {
  const form = useForm({
    resolver: zodResolver(formularioSchema),
    defaultValues: { nombre: '' },
  })
  const [nombre, setNombre] = useState('')
  const activos = useArtistasActivos()
  const resultado = useArtistaPorNombre(nombre)
  const consulta = nombre ? resultado : activos
  const artistas = nombre
    ? resultado.data
      ? [resultado.data]
      : []
    : (activos.data ?? [])
  const sinCoincidencia =
    !!nombre &&
    consulta.error instanceof ApiError &&
    consulta.error.status === 404
  return (
    <div className="space-y-6">
      <div>
        <p className="text-marca-600 dark:text-marca-500 text-sm font-semibold">
          Conoce a los artistas
        </p>
        <h1 className="mt-1 text-3xl font-bold">Artistas</h1>
      </div>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={form.handleSubmit(({ nombre }) => setNombre(nombre))}
      >
        <div className="flex-1">
          <Campo
            etiqueta="Nombre artístico"
            {...form.register('nombre')}
            error={form.formState.errors.nombre?.message}
          />
        </div>
        <Boton type="submit">Buscar artista</Boton>
        {nombre && (
          <Boton
            variante="secundario"
            onClick={() => {
              form.reset()
              setNombre('')
            }}
          >
            Ver todos
          </Boton>
        )}
      </form>
      {consulta.isPending && <Cargando lineas={6} />}
      {sinCoincidencia && (
        <EstadoVacio mensaje="No encontramos un artista con ese nombre." />
      )}
      {consulta.isError && !sinCoincidencia && (
        <EstadoError
          mensaje={consulta.error.message}
          onReintentar={() => consulta.refetch()}
        />
      )}
      {consulta.isSuccess && artistas.length === 0 && (
        <EstadoVacio mensaje="Aún no hay artistas activos" />
      )}
      {consulta.isSuccess && artistas.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artistas.map((artista) => (
            <Link
              key={artista.id}
              to={RUTAS.artista(artista.id)}
              className="focus-visible:outline-marca-600 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Tarjeta className="h-full p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <span className="bg-marca-100 text-marca-700 dark:bg-marca-600/20 relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold">
                    {artista.stageName.slice(0, 1).toUpperCase()}
                    {artista.imageUrl && (
                      <img
                        src={artista.imageUrl}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <div>
                    <h2 className="font-bold">{artista.stageName}</h2>
                    <p className="text-sm text-slate-500">
                      {artista.genre ?? 'Artista'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {artista.country ?? ''}
                    </p>
                  </div>
                </div>
              </Tarjeta>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
