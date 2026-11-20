import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Link } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/hooks'
import { LoginSchema, type LoginForm } from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { leerEstadoLogin } from '../lib/navegacion'
import { RUTAS } from '../lib/rutas'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const estado = leerEstadoLogin(ubicacion.state)
  const [error, setError] = useState<string | null>(null)
  const [mostrar, setMostrar] = useState(false)
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  async function enviar(datos: LoginForm) {
    setError(null)
    try {
      await iniciarSesion(datos.identifier, datos.password)
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
        } else if (caught.status === 0 || caught.status >= 500) setError('Inténtalo más tarde.')
        else setError(caught.message)
      } else {
        setError('Inténtalo más tarde.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Tarjeta className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-marca-600 text-xl font-bold text-white">♪</span>
          <h1 className="mt-4 text-3xl font-bold">Inicia sesión</h1>
        </div>

        {estado.registrado && <Aviso tipo="exito" className="mb-4">Cuenta creada, inicia sesión.</Aviso>}
        {estado.motivo === 'expirada' && <Aviso tipo="advertencia" className="mb-4">Tu sesión expiró.</Aviso>}

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
              className="absolute right-3 bottom-2 min-h-7 px-1 text-xs font-semibold text-marca-600"
              aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrar ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {error && <Aviso tipo="error">{error}</Aviso>}
          <Boton type="submit" className="w-full" cargando={form.formState.isSubmitting}>Ingresar</Boton>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta? <Link to={RUTAS.registro} className="font-semibold text-marca-600 dark:text-marca-500">Regístrate</Link>
        </p>
      </Tarjeta>
    </div>
  )
}