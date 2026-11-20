import type { ReactNode } from 'react'

export interface Columna<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
}

interface TablaProps<T> {
  columnas: Columna<T>[]
  filas: T[]
  clave: (fila: T) => string | number
  descripcion: string // caption accesible
}

export default function Tabla<T>({
  columnas,
  filas,
  clave,
  descripcion,
}: TablaProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{descripcion}</caption>
        <thead className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <tr>
            {columnas.map((c) => (
              <th
                key={c.encabezado}
                scope="col"
                className="px-4 py-3 font-semibold"
              >
                {c.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filas.map((fila) => (
            <tr key={clave(fila)}>
              {columnas.map((c) => (
                <td key={c.encabezado} className="px-4 py-3">
                  {c.celda(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
