import { useSearchParams } from 'react-router'
import { useMemo } from 'react'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import TarjetaEvento from '../componentes/TarjetaEvento'
import Boton from '../componentes/Boton'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useEventosPorArtista, useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { EventCategorySchema } from '../funcionalidades/eventos/tipos'
import { nombreCategoria } from '../funcionalidades/eventos/formato'

export default function CatalogoEventos() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const categoriaParam = params.get('categoria') ?? ''
  const artista = params.get('artista') ?? ''
  const artistas = useArtistasActivos()
  const publicados = useEventosPublicados()
  const porArtista = useEventosPorArtista(artista || null)
  const consulta = artista ? porArtista : publicados

  function actualizar(nombre: 'q' | 'categoria' | 'artista', valor: string) {
    const next = new URLSearchParams(params)
    if (valor) next.set(nombre, valor)
    else next.delete(nombre)
    setParams(next)
  }

  const categoriaValida = EventCategorySchema.safeParse(categoriaParam)
  const filtrados = useMemo(() => {
    if (!consulta.isSuccess) return []
    const texto = q.trim().toLowerCase()
    return consulta.data.filter((evento) => {
      const coincideTexto = !texto ||
        evento.name.toLowerCase().includes(texto) ||
        evento.venueName.toLowerCase().includes(texto)
      const coincideCategoria = !categoriaValida.success || evento.category === categoriaValida.data
      return coincideTexto && coincideCategoria
    })
  }, [consulta.isSuccess, consulta.data, q, categoriaValida.success, categoriaValida.data])

  const categorias = EventCategorySchema.options

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-marca-600 dark:text-marca-500">Descubre experiencias</p>
        <h1 className="mt-1 text-3xl font-bold">Cartelera</h1>
      </div>

      <div className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto] dark:bg-slate-900 dark:ring-slate-800">
        <label className="sr-only" htmlFor="buscar-evento">Buscar por nombre</label>
        <input
          id="buscar-evento"
          value={q}
          onChange={(e) => actualizar('q', e.target.value)}
          placeholder="Buscar por nombre…"
          className="min-h-11 rounded-lg border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-950"
        />
        <label className="sr-only" htmlFor="categoria-evento">Categoría</label>
        <select id="categoria-evento" value={categoriaParam} onChange={(e) => actualizar('categoria', e.target.value)}
          className="min-h-11 rounded-lg border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-950">
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => <option key={categoria} value={categoria}>{nombreCategoria(categoria)}</option>)}
        </select>
        <label className="sr-only" htmlFor="artista-evento">Artista</label>
        <select id="artista-evento" value={artista} onChange={(e) => actualizar('artista', e.target.value)}
          className="min-h-11 rounded-lg border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-950">
          <option value="">Todos los artistas</option>
          {artistas.isSuccess && artistas.data.map((item) => (
            <option key={item.id} value={item.stageName}>{item.stageName}</option>
          ))}
        </select>
        <Boton variante="fantasma" onClick={() => setParams({})}>Limpiar</Boton>
      </div>

      {consulta.isPending && <Cargando lineas={6} />}
      {consulta.isError && <EstadoError mensaje={consulta.error.message} onReintentar={() => consulta.refetch()} />}
      {consulta.isSuccess && filtrados.length === 0 && (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <img src="/images/concert-login.jpg" alt="" className="h-48 w-full object-cover opacity-80" />
          <EstadoVacio
            mensaje={artista || q || categoriaParam ? 'Sin resultados para tu búsqueda' : 'Aún no hay eventos publicados'}
            accion={artista || q || categoriaParam ? <Boton variante="secundario" onClick={() => setParams({})}>Limpiar filtros</Boton> : undefined}
          />
        </div>
      )}
      {consulta.isSuccess && filtrados.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((evento) => <TarjetaEvento key={evento.id} evento={evento} />)}
        </div>
      )}
    </div>
  )
}
