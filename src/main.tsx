import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './funcionalidades/auth/AuthContext'
import PruebaConexion from './PruebaConexion'

const raiz = document.getElementById('root')
if (raiz === null) throw new Error('No existe #root')

// Orden definitivo del PRD: QueryClientProvider > AuthProvider > RouterProvider.
// Reemplaza <PruebaConexion /> por <RouterProvider router={router} /> en la etapa 4.
createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PruebaConexion />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)