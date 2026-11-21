import { createContext, useContext, type ReactNode } from 'react'
import type { TipoAviso } from '../componentes/Aviso'

export interface ContextoAvisos {
  mostrar: (tipo: TipoAviso, mensaje: ReactNode) => void
}

export const ContextoAvisosGlobales = createContext<ContextoAvisos>({
  mostrar: () => undefined,
})

export function useAvisosGlobales() {
  return useContext(ContextoAvisosGlobales)
}
