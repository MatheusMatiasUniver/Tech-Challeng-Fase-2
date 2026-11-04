import bcrypt from 'bcryptjs'

// Mesmo custo usado no seed. Cada +1 dobra o tempo de calculo do hash.
const PASSWORD_HASH_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS)
}
