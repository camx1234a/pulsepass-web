import Aviso from './Aviso'
import Boton from './Boton'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export default function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="space-y-3 text-center">
      <Aviso tipo="error">{mensaje}</Aviso>
      {onReintentar && <Boton onClick={onReintentar}>Reintentar</Boton>}
    </div>
  )
}