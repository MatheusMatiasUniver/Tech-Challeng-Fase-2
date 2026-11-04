import { type NextFunction, type Request, type Response } from 'express'

import { type UserRole } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'

const forbiddenMessages: Record<UserRole, string> = {
  aluno: 'Acesso restrito a alunos',
  professor: 'Acesso restrito a professores',
}

// Deve vir depois do jwtValidate, que preenche request.userRole.
export function requireRole(role: UserRole) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (request.userRole === undefined) {
      next(new AppError('Não autorizado', 401))
      return
    }

    if (request.userRole !== role) {
      next(new AppError(forbiddenMessages[role], 403))
      return
    }

    next()
  }
}
