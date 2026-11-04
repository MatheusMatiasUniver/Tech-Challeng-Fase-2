import { QueryFailedError } from 'typeorm'

import { AppDataSource } from '../../database/data-source'
import { Post } from '../../entities/post.entity'
import { User, type UserRole } from '../../entities/user.entity'
import {
  type CreateUserData,
  type PaginatedUsers,
  type PaginationParams,
  type UpdateUserData,
  type UserRepositoryInterface,
} from '../user-repository.interface'
import { UserHasPostsError } from '../errors/user-has-posts-error'

// Codigo do PostgreSQL para violacao de chave estrangeira.
const FOREIGN_KEY_VIOLATION = '23503'

function isForeignKeyViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION
  )
}

export class TypeOrmUserRepository implements UserRepositoryInterface {
  private readonly repository = AppDataSource.getRepository(User)

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create(data)

    return this.repository.save(user)
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id)
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UserHasPostsError()
      }

      throw error
    }
  }

  // Se um post novo for publicado no meio da transacao, a FK RESTRICT faz o
  // DELETE do usuario falhar e tudo e desfeito: nada e apagado pela metade.
  async deleteWithPosts(id: string): Promise<void> {
    try {
      await AppDataSource.transaction(async (manager) => {
        await manager.delete(Post, { authorId: id })
        await manager.delete(User, { id })
      })
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UserHasPostsError()
      }

      throw error
    }
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
