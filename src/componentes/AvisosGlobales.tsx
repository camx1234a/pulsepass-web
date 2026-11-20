import { useCallback, useState, type ReactNode } from 'react'
import Aviso, { type TipoAviso } from './Aviso'
import { ContextoAvisosGlobales } from '../lib/avisos'

interface AvisoGlobal {
  id: number
  tipo: TipoAviso
  mensaje: ReactNode
}

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<AvisoGlobal[]>([])

  const mostrar = useCallback((tipo: TipoAviso, mensaje: ReactNode) => {
    const id = Date.now() + Math.random()
    setAvisos((actuales) => [...actuales, { id, tipo, mensaje }])
    window.setTimeout(() => {
      setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id))
    }, 4000)
  }, [])

  return (
    <ContextoAvisosGlobales value={{ mostrar }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notificaciones"
        className="fixed right-4 bottom-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {avisos.map((aviso) => (
          <Aviso
            key={aviso.id}
            tipo={aviso.tipo}
            className="shadow-lg"
            onCerrar={() =>
              setAvisos((actuales) =>
                actuales.filter((item) => item.id !== aviso.id),
              )
            }
          >
            {aviso.mensaje}
          </Aviso>
        ))}
      </div>
    </ContextoAvisosGlobales>
  )
}
