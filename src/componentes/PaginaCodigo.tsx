import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'
import { clasesBoton } from './estilos'
import Tarjeta from './Tarjeta'

interface PaginaCodigoProps {
  codigo: string
  mensaje: string
}

export default function PaginaCodigo({ codigo, mensaje }: PaginaCodigoProps) {
  return (
    <Tarjeta className="mx-auto max-w-lg p-8 text-center">
      <h1 className="font-titulo text-marca-700 text-6xl font-bold">
        {codigo}
      </h1>
      <p className="mt-3">{mensaje}</p>
      <Link to={RUTAS.inicio} className={clasesBoton('primario', 'mt-6')}>
        Volver al inicio
      </Link>
    </Tarjeta>
  )
}
