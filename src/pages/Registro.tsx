import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Tarjeta from '../componentes/Tarjeta'
import { useRegistrarUsuario } from '../funcionalidades/usuarios/hooks'
import {
  RegistroSchema,
  type RegistroForm,
} from '../funcionalidades/usuarios/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { fechaHoyLocal } from '../lib/formato'

export default function Registro() {
  const navigate = useNavigate()
  const registrar = useRegistrarUsuario()
  const [mostrar, setMostrar] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const form = useForm<RegistroForm>({
    resolver: zodResolver(RegistroSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      birthDate: '',
      password: '',
    },
  })

  async function enviar(datos: RegistroForm) {
    setErrorGeneral(null)
    try {
      await registrar.mutateAsync(datos)
      navigate(RUTAS.login, { replace: true, state: { registrado: true } })
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.status === 409)
          setErrorGeneral('El usuario o correo ya está registrado.')
        else if (caught.status === 400) {
          let hayCampos = false
          Object.entries(caught.details).forEach(([campo, mensaje]) => {
            if (campo in datos) {
              hayCampos = true
              form.setError(campo as keyof RegistroForm, { message: mensaje })
            }
          })
          if (!hayCampos) setErrorGeneral(caught.message)
        } else setErrorGeneral(caught.message)
      } else {
        setErrorGeneral('Inténtalo más tarde.')
      }
    }
  }

  const password = useWatch({
    control: form.control,
    name: 'password',
    defaultValue: '',
  })
  const fortaleza =
    password.length === 0
      ? ''
      : password.length < 12
        ? 'Débil'
        : password.length < 16
          ? 'Media'
          : 'Fuerte'

  return (
    <div className="mx-auto max-w-2xl">
      <Tarjeta className="p-6 sm:p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Crea tu cuenta</h1>
        <form className="space-y-4" onSubmit={form.handleSubmit(enviar)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Nombre de usuario"
              autoComplete="username"
              {...form.register('username')}
              error={form.formState.errors.username?.message}
            />
            <Campo
              etiqueta="Correo electrónico"
              type="email"
              autoComplete="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Campo
              etiqueta="Nombres"
              autoComplete="given-name"
              {...form.register('firstName')}
              error={form.formState.errors.firstName?.message}
            />
            <Campo
              etiqueta="Apellidos"
              autoComplete="family-name"
              {...form.register('lastName')}
              error={form.formState.errors.lastName?.message}
            />
            <Campo
              etiqueta="Fecha de nacimiento"
              type="date"
              max={fechaHoyLocal()}
              {...form.register('birthDate')}
              error={form.formState.errors.birthDate?.message}
            />
            <Campo
              etiqueta="Teléfono (opcional)"
              type="tel"
              autoComplete="tel"
              {...form.register('phone')}
              error={form.formState.errors.phone?.message}
            />
            <Campo
              etiqueta="Ciudad (opcional)"
              autoComplete="address-level2"
              {...form.register('city')}
              error={form.formState.errors.city?.message}
            />
          </div>
          <div className="relative">
            <Campo
              etiqueta="Contraseña (mínimo 12 caracteres)"
              type={mostrar ? 'text' : 'password'}
              autoComplete="new-password"
              ayuda="Mínimo 12 caracteres y máximo 72 bytes."
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setMostrar((valor) => !valor)}
              className="text-marca-600 absolute top-7 right-3 min-h-7 px-1 text-xs font-semibold"
              aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrar ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {fortaleza && (
            <p className="text-xs text-slate-500">Fortaleza: {fortaleza}</p>
          )}
          {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
          <Boton
            type="submit"
            className="w-full"
            cargando={registrar.isPending}
          >
            Crear cuenta
          </Boton>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={RUTAS.login}
            className="text-marca-600 dark:text-marca-500 font-semibold"
          >
            Inicia sesión
          </Link>
        </p>
      </Tarjeta>
    </div>
  )
}
