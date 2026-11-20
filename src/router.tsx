import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import Layout from './layouts/Layout'
import RutaPorRol from './layouts/RutaPorRol'
import RutaProtegida from './layouts/RutaProtegida'
import SoloAnonimo from './layouts/SoloAnonimo'
import { PATRONES, RUTAS } from './lib/rutas'
import ErrorPagina from './pages/ErrorPagina'
import Inicio from './pages/Inicio'

// FE-012: toda página es perezosa, salvo Layout e Inicio.
type Importador = () => Promise<{ default: ComponentType }>
const perezosa = (importar: Importador) => async () => ({ Component: (await importar()).default })

// Las rutas hijas son relativas: se quita la barra inicial de RUTAS.
const rel = (ruta: string): string => ruta.slice(1)

export const router = createBrowserRouter([
  {
    path: RUTAS.inicio,
    Component: Layout,
    errorElement: <ErrorPagina />,
    children: [
      {
        // Los errores de página se muestran dentro del Layout (la navbar sigue visible).
        errorElement: <ErrorPagina />,
        children: [
          { index: true, Component: Inicio },

          // Públicas
          { path: rel(RUTAS.eventos), lazy: perezosa(() => import('./pages/CatalogoEventos')) },
          { path: PATRONES.evento, lazy: perezosa(() => import('./pages/DetalleEvento')) },
          { path: rel(RUTAS.artistas), lazy: perezosa(() => import('./pages/ListaArtistas')) },
          { path: PATRONES.artista, lazy: perezosa(() => import('./pages/DetalleArtista')) },
          { path: rel(RUTAS.sedes), lazy: perezosa(() => import('./pages/ListaSedes')) },
          { path: PATRONES.sede, lazy: perezosa(() => import('./pages/DetalleSede')) },

          // Solo anónimos
          {
            element: <SoloAnonimo />,
            children: [
              { path: rel(RUTAS.login), lazy: perezosa(() => import('./pages/Login')) },
              { path: rel(RUTAS.registro), lazy: perezosa(() => import('./pages/Registro')) },
            ],
          },

          // Autenticadas
          {
            element: <RutaProtegida />,
            children: [
              { path: rel(RUTAS.cuenta), lazy: perezosa(() => import('./pages/Cuenta')) },
              {
                element: <RutaPorRol roles={['USER']} />,
                children: [
                  { path: rel(RUTAS.misTickets), lazy: perezosa(() => import('./pages/MisTickets')) },
                  { path: PATRONES.ticket, lazy: perezosa(() => import('./pages/DetalleTicket')) },
                  { path: PATRONES.confirmacionCompra, lazy: perezosa(() => import('./pages/ConfirmacionCompra')) },
                ],
              },
              {
                element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
                children: [
                  { path: rel(RUTAS.staffValidacion), lazy: perezosa(() => import('./pages/ValidacionIngreso')) },
                  { path: PATRONES.staffTicketsPagados, lazy: perezosa(() => import('./pages/TicketsPagadosEvento')) },
                ],
              },
              {
                element: <RutaPorRol roles={['ADMIN']} />,
                children: [
                  { path: rel(RUTAS.adminEventos), lazy: perezosa(() => import('./pages/AdminEventos')) },
                  { path: rel(RUTAS.adminNuevoEvento), lazy: perezosa(() => import('./pages/AdminCrearEvento')) },
                  { path: PATRONES.adminEvento, lazy: perezosa(() => import('./pages/AdminGestionEvento')) },
                ],
              },
            ],
          },

          { path: rel(RUTAS.sinPermisos), lazy: perezosa(() => import('./pages/SinPermisos')) },
          { path: '*', lazy: perezosa(() => import('./pages/NoEncontrada')) },
        ],
      },
    ],
  },
])