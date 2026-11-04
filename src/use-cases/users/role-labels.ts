import { type UserRole } from '../../entities/user.entity'

// Textos usados nas mensagens de erro para cada papel.
export const roleLabels: Record<UserRole, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
}
