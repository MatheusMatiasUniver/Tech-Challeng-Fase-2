import { type User, type UserRole } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'
import {
  type UpdateUserData,
  type UserRepositoryInterface,
} from '../../repositories/user-repository.interface'
import { GetUserUseCase } from './get-user'
import { hashPassword } from './password'

export interface UpdateUserInput {
  email?: string
  name?: string
  password?: string
}

export class UpdateUserUseCase {
  private readonly getUser: GetUserUseCase

  constructor(
    private readonly usersRepository: UserRepositoryInterface,
    role: UserRole,
  ) {
    this.getUser = new GetUserUseCase(usersRepository, role)
  }

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.getUser.execute(id)

    if (input.email !== undefined && input.email !== user.email) {
      const emailOwner = await this.usersRepository.findByEmail(input.email)

      if (emailOwner !== null) {
        throw new AppError('E-mail já cadastrado', 409)
      }
    }

    const data: UpdateUserData = { email: input.email, name: input.name }

    // A senha so muda quando vem no corpo; nunca se grava texto puro.
    if (input.password !== undefined) {
      data.passwordHash = await hashPassword(input.password)
    }

    const updatedUser = await this.usersRepository.update(id, data)

    if (updatedUser === null) {
      return this.getUser.execute(id)
    }

    return updatedUser
  }
}
