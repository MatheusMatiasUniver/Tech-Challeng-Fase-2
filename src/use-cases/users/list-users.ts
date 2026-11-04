import { type User, type UserRole } from '../../entities/user.entity'
import {
  type PaginationParams,
  type UserRepositoryInterface,
} from '../../repositories/user-repository.interface'

export interface ListUsersResponse {
  data: User[]
  meta: {
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export class ListUsersUseCase {
  constructor(
    private readonly usersRepository: UserRepositoryInterface,
    private readonly role: UserRole,
  ) {}

  async execute(pagination: PaginationParams): Promise<ListUsersResponse> {
    const { total, users } = await this.usersRepository.findManyByRole(
      this.role,
      pagination,
    )

    return {
      data: users,
      meta: {
        limit: pagination.limit,
        page: pagination.page,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    }
  }
}
