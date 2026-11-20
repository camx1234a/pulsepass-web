import { describe, expect, it } from 'vitest'
import { RegistroSchema } from './tipos'

const registro = {
  username: 'andrea',
  email: 'andrea@example.test',
  firstName: 'Andrea',
  lastName: 'Ruiz',
  birthDate: '2000-04-12',
  password: 'ContrasenaSegura12',
}

describe('RegistroSchema', () => {
  it('acepta los datos mínimos válidos y limita la contraseña por bytes UTF-8', () => {
    expect(RegistroSchema.safeParse(registro).success).toBe(true)
    expect(RegistroSchema.safeParse({ ...registro, password: '12345678901' }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...registro, password: 'á'.repeat(37) }).success).toBe(false)
  })

  it('rechaza fecha futura, username con arroba y correo inválido', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    expect(RegistroSchema.safeParse({ ...registro, birthDate: tomorrow }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...registro, username: 'ana@example.test' }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...registro, email: 'no-es-email' }).success).toBe(false)
  })
})
