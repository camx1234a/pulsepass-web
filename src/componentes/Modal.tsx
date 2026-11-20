import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconoCerrar } from './Iconos'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

export default function Modal({ abierto, titulo, onCerrar, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (dialogo === null) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={() => {
        if (abierto) onCerrar()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar() // clic en el fondo
      }}
      className="m-auto w-full max-w-md rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id={idTitulo} className="text-lg font-semibold">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded p-1">
            <IconoCerrar />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}