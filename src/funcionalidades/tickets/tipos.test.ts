import { describe, expect, it } from 'vitest'
import { CodigoTicketSchema } from './tipos'

describe('CodigoTicketSchema', () => {
  it('acepta los códigos TCK emitidos por el backend y rechaza códigos de formato distinto', () => {
    expect(CodigoTicketSchema.safeParse('TCK-8f2a1c-4b1d').success).toBe(true)
    expect(CodigoTicketSchema.safeParse('TKT-8f2a1c').success).toBe(false)
    expect(CodigoTicketSchema.safeParse('   ').success).toBe(false)
  })
})
