import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import Selector from '../componentes/Selector'
import Tarjeta from '../componentes/Tarjeta'
import { useCrearEvento } from '../funcionalidades/eventos/hooks'
import { CrearEventoSchema, EventCategorySchema, type CrearEventoForm } from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const sedes = useSedesActivas()
  const crear = useCrearEvento()
  const form = useForm<CrearEventoForm>({
    resolver: zodResolver(CrearEventoSchema),
    defaultValues: { eventCode: '', name: '', description: '', category: 'MUSIC', eventDate: '', minimumAge: 0, venueCode: '', imageUrl: '' },
  })
  const descripcion = useWatch({ control: form.control, name: 'description', defaultValue: '' })

  async function enviar(datos: CrearEventoForm) {
    try {
      const evento = await crear.mutateAsync(datos)
      navigate(RUTAS.adminEvento(evento.eventCode), { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        Object.entries(error.details).forEach(([campo, mensaje]) => {
          if (campo in datos) form.setError(campo as keyof CrearEventoForm, { message: mensaje })
        })
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between"><Link to={RUTAS.adminEventos} className="text-sm font-semibold text-marca-600">← Eventos</Link><p className="text-sm text-slate-500">Nuevo evento</p></div>
      <Tarjeta className="p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">Crear evento</h1>
        {crear.isError && <Aviso tipo={crear.error instanceof ApiError && crear.error.status === 409 ? 'advertencia' : 'error'} className="mb-5">{crear.error.message}</Aviso>}
        {sedes.isError && <Aviso tipo="error" className="mb-5">{sedes.error.message}</Aviso>}
        {sedes.isSuccess && sedes.data.length === 0 && <Aviso tipo="advertencia" className="mb-5">El backend no tiene sedes activas. Debes registrar o activar una sede en el backend antes de crear eventos.</Aviso>}
        <form onSubmit={form.handleSubmit(enviar)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Código del evento" {...form.register('eventCode')} error={form.formState.errors.eventCode?.message} />
            <Campo etiqueta="Nombre" {...form.register('name')} error={form.formState.errors.name?.message} />
          </div>
          <div>
            <label htmlFor="descripcion" className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea id="descripcion" rows={4} maxLength={500} {...form.register('description')} className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" />
            <p className="text-right text-xs text-slate-500">{(descripcion ?? '').length}/500</p>
            {form.formState.errors.description && <p className="text-xs text-red-700">{form.formState.errors.description.message}</p>}
          </div>
          <Campo etiqueta="Imagen del evento (URL)" type="url" {...form.register('imageUrl')} error={form.formState.errors.imageUrl?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Selector etiqueta="Categoría" {...form.register('category')}>
              {EventCategorySchema.options.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </Selector>
            <Campo etiqueta="Edad mínima" type="number" min={0} {...form.register('minimumAge', { valueAsNumber: true })} error={form.formState.errors.minimumAge?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Fecha y hora" type="datetime-local" {...form.register('eventDate')} error={form.formState.errors.eventDate?.message} />
            <Selector etiqueta="Sede" {...form.register('venueCode')} error={form.formState.errors.venueCode?.message} disabled={!sedes.isSuccess || sedes.data.length === 0}>
              <option value="">Selecciona una sede</option>
              {sedes.isSuccess && sedes.data.map((sede) => <option key={sede.code} value={sede.code}>{sede.name} ({sede.code})</option>)}
            </Selector>
          </div>
          {sedes.isPending && <Cargando lineas={1} />}
          <div className="flex justify-end gap-3">
            <Link to={RUTAS.adminEventos} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700">Cancelar</Link>
            <Boton type="submit" cargando={crear.isPending} disabled={!sedes.isSuccess || sedes.data.length === 0}>Crear evento</Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}
