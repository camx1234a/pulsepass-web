import type { ComponentProps } from 'react'
import clsx from 'clsx'

export default function Tarjeta({ className, ...resto }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800',
        className,
      )}
      {...resto}
    />
  )
}
