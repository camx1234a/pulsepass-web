import { useId, type ComponentProps } from 'react'
import clsx from 'clsx'

interface SelectorProps extends ComponentProps<'select'> {
  etiqueta: string
  error?: string
}

export default function Selector({
  etiqueta,
  error,
  id,
  className,
  children,
  ...resto
}: SelectorProps) {
  const idAuto = useId()
  const idCampo = id ?? idAuto
  const idError = `${idCampo}-error`

  return (
    <div className="space-y-1">
      <label
        htmlFor={idCampo}
        className="block text-sm font-medium text-slate-900 dark:text-slate-100"
      >
        {etiqueta}
      </label>
      <select
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={clsx(
          'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100',
          'focus-visible:outline-marca-600 focus-visible:outline-2 focus-visible:outline-offset-2',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700',
          className,
        )}
        {...resto}
      >
        {children}
      </select>
      {error && (
        <p
          id={idError}
          role="alert"
          className="text-xs text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}
