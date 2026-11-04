import { type UserRole } from '../../entities/user.entity'
import { TypeOrmPostRepository } from '../../repositories/typeorm/typeorm-post-repository'
import { TypeOrmUserRepository } from '../../repositories/typeorm/typeorm-user-repository'
import { GetProfileUseCase } from '../auth/get-profile'
import { CreateUserUseCase } from '../users/create-user'
import { DeleteUserUseCase } from '../users/delete-user'
import { GetUserUseCase } from '../users/get-user'
import { ListUsersUseCase } from '../users/list-users'
import { UpdateUserUseCase } from '../users/update-user'

export function makeListUsersUseCase(role: UserRole): ListUsersUseCase {
  return new ListUsersUseCase(new TypeOrmUserRepository(), role)
}

export function makeGetUserUseCase(role: UserRole): GetUserUseCase {
  return new GetUserUseCase(new TypeOrmUserRepository(), role)
}

export function makeCreateUserUseCase(role: UserRole): CreateUserUseCase {
  return new CreateUserUseCase(new TypeOrmUserRepository(), role)
}

export function makeUpdateUserUseCase(role: UserRole): UpdateUserUseCase {
  return new UpdateUserUseCase(new TypeOrmUserRepository(), role)
}

export function makeDeleteUserUseCase(role: UserRole): DeleteUserUseCase {
  return new DeleteUserUseCase(
    new TypeOrmUserRepository(),
    new TypeOrmPostRepository(),
    role,
  )
}

export function makeGetProfileUseCase(): GetProfileUseCase {
  return new GetProfileUseCase(new TypeOrmUserRepository())
}
