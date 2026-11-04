import { type User } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'

export class GetProfileUseCase {
  constructor(private readonly usersRepository: UserRepositoryInterface) {}

  // Um token valido de um usuario que ja foi excluido nao deve abrir sessao.
  async execute(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId)

    if (user === null) {
      throw new AppError('Não autorizado', 401)
    }

    return user
  }
}
