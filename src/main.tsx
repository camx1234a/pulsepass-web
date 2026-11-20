import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './funcionalidades/auth/AuthContext'
import { router } from './router'
import { ProveedorAvisos } from './componentes/AvisosGlobales'

const raiz = document.getElementById('root')
if (raiz === null) throw new Error('No existe #root')

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ProveedorAvisos>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ProveedorAvisos>
    </QueryClientProvider>
  </StrictMode>,
)
