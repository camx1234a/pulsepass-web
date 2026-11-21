import clsx from 'clsx'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

// Clases completas, nunca construidas dinámicamente (FE-008).
const variantes: Record<VarianteBoton, string> = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700',
  secundario:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 ' +
    'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma:
    'text-marca-600 hover:bg-marca-50 dark:text-marca-500 dark:hover:bg-slate-800',
}

/** Para dar apariencia de botón a un <Link>. */
export const clasesBoton = (
  variante: VarianteBoton = 'primario',
  extra?: string,
): string => clsx(base, variantes[variante], extra)
