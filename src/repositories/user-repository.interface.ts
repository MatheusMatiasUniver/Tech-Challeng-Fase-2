import { User, type UserRole } from '../entities/user.entity'

export interface CreateUserData {
  email: string
  id?: string
  name: string
  passwordHash: string
  role: UserRole
}

export interface UserRepositoryInterface {
  create(data: CreateUserData): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
