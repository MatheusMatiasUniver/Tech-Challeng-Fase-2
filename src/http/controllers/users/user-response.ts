import { type User } from '../../../entities/user.entity'

// Lista explicita de campos: o hash da senha nunca sai da API, mesmo que
// novas colunas sejam adicionadas na entidade.
export function serializeUser(user: User): object {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
