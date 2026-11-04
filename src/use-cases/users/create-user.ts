import { type User, type UserRole } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'
import { hashPassword } from './password'

export interface CreateUserInput {
  email: string
  name: string
  password: string
}

export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UserRepositoryInterface,
    private readonly role: UserRole,
  ) {}

  async execute({ email, name, password }: CreateUserInput): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email)

    if (existingUser !== null) {
      throw new AppError('E-mail já cadastrado', 409)
    }

    return this.usersRepository.create({
      email,
      name,
      passwordHash: await hashPassword(password),
      role: this.role,
    })
  }
}
