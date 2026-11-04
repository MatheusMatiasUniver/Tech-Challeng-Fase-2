import { User, type UserRole } from '../entities/user.entity'

export interface CreateUserData {
  email: string
  id?: string
  name: string
  passwordHash: string
  role: UserRole
}

export interface UpdateUserData {
  email?: string
  name?: string
  passwordHash?: string
}

export interface PaginationParams {
  limit: number
  page: number
}

export interface PaginatedUsers {
  total: number
  users: User[]
}

export interface UserRepositoryInterface {
  create(data: CreateUserData): Promise<User>
  delete(id: string): Promise<void>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  findManyByRole(
    role: UserRole,
    pagination: PaginationParams,
  ): Promise<PaginatedUsers>
  update(id: string, data: UpdateUserData): Promise<User | null>
}
