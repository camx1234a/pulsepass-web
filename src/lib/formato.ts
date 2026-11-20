const fechaFmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
const fechaHoraFmt = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})
const monedaFmt = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
})

function aDate(valor: string): Date {
  return new Date(valor.length === 10 ? `${valor}T00:00:00` : valor)
}

export const formatearFecha = (valor: string): string => fechaFmt.format(aDate(valor))
export const formatearFechaHora = (valor: string): string => fechaHoraFmt.format(aDate(valor))
export const formatearCOP = (valor: number): string => monedaFmt.format(valor)

/** Fecha local de hoy como YYYY-MM-DD (para comparar con birthDate sin pasar por UTC). */
export function fechaHoyLocal(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}