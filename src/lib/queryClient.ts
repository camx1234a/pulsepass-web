import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      
      retry: (intentos, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return intentos < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false }, // nunca reintentar mutaciones (evita compras duplicadas)
  },
})