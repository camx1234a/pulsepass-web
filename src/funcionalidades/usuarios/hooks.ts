import { useMutation, useQuery } from '@tanstack/react-query'
import {
  obtenerUsuarioPorEmail,
  obtenerUsuarioPorUsername,
  registrarUsuario,
} from './api'

export function useUsuarioPorEmail(email: string) {
  return useQuery({
    queryKey: ['usuarios', 'email', email],
    queryFn: ({ signal }) => obtenerUsuarioPorEmail(email, signal),
    enabled: email.length > 0,
    staleTime: 5 * 60_000,
  })
}

export function useUsuarioPorUsername(username: string) {
  return useQuery({
    queryKey: ['usuarios', 'username', username],
    queryFn: ({ signal }) => obtenerUsuarioPorUsername(username, signal),
    enabled: username.length > 0,
    staleTime: 5 * 60_000,
  })
}

export function useRegistrarUsuario() {
  return useMutation({
    mutationFn: registrarUsuario,
  })
}
