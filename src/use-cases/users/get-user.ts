import { type User, type UserRole } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'
import { roleLabels } from './role-labels'

export class GetUserUseCase {
  constructor(
    private readonly usersRepository: UserRepositoryInterface,
    private readonly role: UserRole,
  ) {}

  // Um id de outro papel responde 404: /students/:id nunca expoe professores
  // e vice-versa.
  async execute(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id)

    if (user === null || user.role !== this.role) {
      throw new AppError(`${roleLabels[this.role]} não encontrado`, 404)
    }

    return user
  }
}
