import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Link } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { useAuth } from '../funcionalidades/auth/hooks'
import { LoginSchema, type LoginForm } from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { leerEstadoLogin } from '../lib/navegacion'
import { RUTAS } from '../lib/rutas'
import { useAvisosGlobales } from '../lib/avisos'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const estado = leerEstadoLogin(ubicacion.state)
  const [error, setError] = useState<string | null>(null)
  const [mostrar, setMostrar] = useState(false)
  const avisos = useAvisosGlobales()
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: '', password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  async function enviar(datos: LoginForm) {
    setError(null)
    try {
      await iniciarSesion(datos.identifier, datos.password)
      avisos.mostrar('exito', 'Sesión iniciada correctamente.')
      navigate(estado.desde ?? RUTAS.inicio, { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.status === 401) setError('Credenciales inválidas.')
        else if (caught.status === 400) {
          Object.entries(caught.details).forEach(([campo, mensaje]) => {
            if (campo === 'identifier' || campo === 'password') {
              form.setError(campo, { message: mensaje })
            }
          })
          if (Object.keys(caught.details).length === 0) setError(caught.message)
        } else if (caught.status === 0 || caught.status >= 500)
          setError('Inténtalo más tarde.')
        else setError(caught.message)
      } else {
        setError('Inténtalo más tarde.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid lg:grid-cols-2 dark:bg-slate-900 dark:ring-slate-800">
      <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <img
          src="/images/concert-login.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/85 via-indigo-950/60 to-rose-950/70" />
        <div className="relative">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
            ♪
          </span>
          <p className="mt-7 text-sm font-semibold tracking-[0.2em] text-white/75 uppercase">
            PulsePass
          </p>
          <h2 className="mt-3 max-w-md text-4xl leading-tight font-bold">
            Las mejores historias comienzan en vivo.
          </h2>
        </div>
        <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <p className="text-lg font-semibold">Descubre. Comparte. Vive.</p>
          <p className="mt-1 text-sm text-white/75">
            Tu próxima experiencia inolvidable está a un paso.
          </p>
        </div>
      </aside>
      <div className="flex items-center p-6 sm:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <span className="bg-marca-600 mx-auto flex size-12 items-center justify-center rounded-xl text-xl font-bold text-white">
              ♪
            </span>
            <h1 className="mt-4 text-3xl font-bold">Inicia sesión</h1>
            <p className="mt-2 text-sm text-slate-500">
              Continúa donde la emoción empieza.
            </p>
          </div>

          {estado.registrado && (
            <Aviso tipo="exito" className="mb-4">
              Cuenta creada, inicia sesión.
            </Aviso>
          )}
          {estado.motivo === 'expirada' && (
            <Aviso tipo="advertencia" className="mb-4">
              Tu sesión expiró.
            </Aviso>
          )}

          <form className="space-y-4" onSubmit={form.handleSubmit(enviar)}>
            <Campo
              etiqueta="Usuario o correo"
              autoComplete="username"
              {...form.register('identifier')}
              error={form.formState.errors.identifier?.message}
            />
            <div className="relative">
              <Campo
                etiqueta="Contraseña"
                type={mostrar ? 'text' : 'password'}
                autoComplete="current-password"
                {...form.register('password')}
                error={form.formState.errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setMostrar((valor) => !valor)}
                className="text-marca-600 absolute right-3 bottom-2 min-h-7 px-1 text-xs font-semibold"
                aria-label={
                  mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {mostrar ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {error && <Aviso tipo="error">{error}</Aviso>}
            <Boton
              type="submit"
              className="w-full"
              cargando={form.formState.isSubmitting}
            >
              Ingresar
            </Boton>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link
              to={RUTAS.registro}
              className="text-marca-600 dark:text-marca-500 font-semibold"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
