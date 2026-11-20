import { useState } from 'react'
import Aviso from './Aviso'
import Boton from './Boton'
import Modal from './Modal'
import { useCancelarTicket } from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'

export default function AccionesTicket({ ticket, email }: { ticket: Ticket; email: string }) {
  const [abierto, setAbierto] = useState(false)
  const cancelar = useCancelarTicket(email)
  if (ticket.status !== 'PAID') return null

  return (
    <>
      <Boton variante="peligro" onClick={() => setAbierto(true)}>Cancelar</Boton>
      <Modal abierto={abierto} titulo="Cancelar ticket" onCerrar={() => setAbierto(false)}>
        <p>¿Seguro que quieres cancelar la entrada <strong>{ticket.ticketCode}</strong>?</p>
        {cancelar.isError && <Aviso tipo="error">{cancelar.error.message}</Aviso>}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={() => setAbierto(false)}>Conservar ticket</Boton>
          <Boton
            variante="peligro"
            cargando={cancelar.isPending}
            onClick={() => cancelar.mutate(ticket.ticketCode, { onSuccess: () => setAbierto(false) })}
          >
            Confirmar cancelación
          </Boton>
        </div>
      </Modal>
    </>
  )
}
