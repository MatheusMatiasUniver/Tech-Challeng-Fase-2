import { AppDataSource } from '../../database/data-source'
import { User, type UserRole } from '../../entities/user.entity'
import {
  type CreateUserData,
  type PaginatedUsers,
  type PaginationParams,
  type UpdateUserData,
  type UserRepositoryInterface,
} from '../user-repository.interface'

export class TypeOrmUserRepository implements UserRepositoryInterface {
  private readonly repository = AppDataSource.getRepository(User)

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create(data)

    return this.repository.save(user)
  }

  // Os posts do usuario sao removidos pelo proprio banco (FK com ON DELETE
  // CASCADE) dentro deste mesmo DELETE, entao a operacao e atomica.
  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email })
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id })
  }

  async findManyByRole(
    role: UserRole,
    { limit, page }: PaginationParams,
  ): Promise<PaginatedUsers> {
    const [users, total] = await this.repository.findAndCount({
      where: { role },
      order: { name: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { total, users }
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    await this.repository.update(id, data)

    return this.findById(id)
  }
}
