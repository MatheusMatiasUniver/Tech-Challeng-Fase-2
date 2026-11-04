import { randomUUID } from 'node:crypto'

import { type User, type UserRole } from '../../src/entities/user.entity'
import {
  type CreateUserData,
  type PaginatedUsers,
  type PaginationParams,
  type UpdateUserData,
  type UserRepositoryInterface,
} from '../../src/repositories/user-repository.interface'

export class InMemoryUserRepository implements UserRepositoryInterface {
  public users: User[] = []

  async create(data: CreateUserData): Promise<User> {
    const now = new Date()
    const user = {
      ...data,
      id: data.id ?? randomUUID(),
      createdAt: now,
      updatedAt: now,
      posts: [],
    } as User

    this.users.push(user)

    return user
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null
  }

  async findManyByRole(
    role: UserRole,
    { limit, page }: PaginationParams,
  ): Promise<PaginatedUsers> {
    const filtered = this.users
      .filter((user) => user.role === role)
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      total: filtered.length,
      users: filtered.slice((page - 1) * limit, page * limit),
    }
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const user = await this.findById(id)

    if (user === null) {
      return null
    }

    const defined = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    )

    Object.assign(user, defined, { updatedAt: new Date() })

    return user
  }
}
