import { type NextFunction, type Request, type Response } from 'express'

import { type UserRole } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'
import { TypeOrmUserRepository } from '../../repositories/typeorm/typeorm-user-repository'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'

const forbiddenMessages: Record<UserRole, string> = {
  aluno: 'Acesso restrito a alunos',
  professor: 'Acesso restrito a professores',
}

// Deve vir depois do jwtValidate, que preenche request.userId e userRole.
//
// O papel do token resolve o caso comum (aluno tentando escrever) sem ir ao
// banco. Para quem passa, o usuario e conferido no banco: um professor
// excluido ou rebaixado para aluno perde o acesso na hora, sem esperar o
// token expirar. E uma busca por chave primaria por requisicao protegida.
export function requireRole(
  role: UserRole,
  makeUsersRepository: () => UserRepositoryInterface = () =>
    new TypeOrmUserRepository(),
) {
  return async (
    request: Request,
    _response: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (request.userId === undefined || request.userRole === undefined) {
      next(new AppError('Não autorizado', 401))
      return
    }

    if (request.userRole !== role) {
      next(new AppError(forbiddenMessages[role], 403))
      return
    }

    try {
      const user = await makeUsersRepository().findById(request.userId)

      if (user === null) {
        next(new AppError('Não autorizado', 401))
        return
      }

      if (user.role !== role) {
        next(new AppError(forbiddenMessages[role], 403))
        return
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
