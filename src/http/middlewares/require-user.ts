import { type NextFunction, type Request, type Response } from 'express'

import { AppError } from '../../errors/app-error'
import { TypeOrmUserRepository } from '../../repositories/typeorm/typeorm-user-repository'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'

// Como o requireRole, mas aceita qualquer papel: so confirma que o dono do
// token ainda existe. Sem isso, um aluno excluido continuaria comentando ate
// o token expirar. Deve vir depois do jwtValidate.
export function requireUser(
  makeUsersRepository: () => UserRepositoryInterface = () =>
    new TypeOrmUserRepository(),
) {
  return async (
    request: Request,
    _response: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (request.userId === undefined) {
      next(new AppError('Não autorizado', 401))
      return
    }

    try {
      const user = await makeUsersRepository().findById(request.userId)

      if (user === null) {
        next(new AppError('Não autorizado', 401))
        return
      }

      // O papel do banco vale mais que o do token (pode ter mudado).
      request.userRole = user.role
      next()
    } catch (error) {
      next(error)
    }
  }
}
