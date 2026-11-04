import bcrypt from 'bcryptjs'

import { AppError } from '../../src/errors/app-error'
import { type PostRepositoryInterface } from '../../src/repositories/post-repository.interface'
import { GetProfileUseCase } from '../../src/use-cases/auth/get-profile'
import { CreateUserUseCase } from '../../src/use-cases/users/create-user'
import { DeleteUserUseCase } from '../../src/use-cases/users/delete-user'
import { GetUserUseCase } from '../../src/use-cases/users/get-user'
import { ListUsersUseCase } from '../../src/use-cases/users/list-users'
import { UpdateUserUseCase } from '../../src/use-cases/users/update-user'
import { InMemoryUserRepository } from '../helpers/in-memory-user-repository'

function makePostsRepository(postsCount: number): PostRepositoryInterface {
  return {
    countByAuthor: async () => postsCount,
    create: async () => {
      throw new Error('Não implementado')
    },
    delete: async () => undefined,
    findAll: async () => [],
    findById: async () => null,
    search: async () => [],
    update: async () => null,
  }
}

async function seedUsers(repository: InMemoryUserRepository): Promise<void> {
  await repository.create({
    email: 'ana@exemplo.com',
    id: 'teacher-ana',
    name: 'Ana',
    passwordHash: 'hash',
    role: 'professor',
  })
  await repository.create({
    email: 'bruno@exemplo.com',
    id: 'teacher-bruno',
    name: 'Bruno',
    passwordHash: 'hash',
    role: 'professor',
  })
  await repository.create({
    email: 'carla@exemplo.com',
    id: 'student-carla',
    name: 'Carla',
    passwordHash: 'hash',
    role: 'aluno',
  })
}

describe('ListUsersUseCase', () => {
  it('returns only users of the requested role with pagination meta', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    const result = await new ListUsersUseCase(repository, 'professor').execute({
      limit: 1,
      page: 2,
    })

    expect(result.data.map((user) => user.name)).toEqual(['Bruno'])
    expect(result.meta).toEqual({ limit: 1, page: 2, total: 2, totalPages: 2 })
  })
})

describe('GetUserUseCase', () => {
  it('returns 404 when the id belongs to another role', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    await expect(
      new GetUserUseCase(repository, 'aluno').execute('teacher-ana'),
    ).rejects.toEqual(new AppError('Aluno não encontrado', 404))
  })
})

describe('CreateUserUseCase', () => {
  it('creates a user with the use case role and a hashed password', async () => {
    const repository = new InMemoryUserRepository()

    const user = await new CreateUserUseCase(repository, 'aluno').execute({
      email: 'novo@exemplo.com',
      name: 'Novo',
      password: '123456',
    })

    expect(user.role).toBe('aluno')
    expect(user.passwordHash).not.toBe('123456')
    await expect(bcrypt.compare('123456', user.passwordHash)).resolves.toBe(
      true,
    )
  })

  it('rejects a duplicated e-mail with 409', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    await expect(
      new CreateUserUseCase(repository, 'aluno').execute({
        email: 'ana@exemplo.com',
        name: 'Outra Ana',
        password: '123456',
      }),
    ).rejects.toEqual(new AppError('E-mail já cadastrado', 409))
  })
})

describe('UpdateUserUseCase', () => {
  it('updates the name and keeps the password when none is sent', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    const user = await new UpdateUserUseCase(repository, 'professor').execute(
      'teacher-ana',
      { name: 'Ana Maria' },
    )

    expect(user.name).toBe('Ana Maria')
    expect(user.passwordHash).toBe('hash')
  })

  it('hashes a new password', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    const user = await new UpdateUserUseCase(repository, 'aluno').execute(
      'student-carla',
      { password: 'nova-senha' },
    )

    await expect(bcrypt.compare('nova-senha', user.passwordHash)).resolves.toBe(
      true,
    )
  })

  it('rejects an e-mail already used by another user with 409', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    await expect(
      new UpdateUserUseCase(repository, 'professor').execute('teacher-ana', {
        email: 'bruno@exemplo.com',
      }),
    ).rejects.toEqual(new AppError('E-mail já cadastrado', 409))
  })
})

describe('DeleteUserUseCase', () => {
  it('blocks deleting your own account', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)
    const useCase = new DeleteUserUseCase(
      repository,
      makePostsRepository(0),
      'professor',
    )

    await expect(
      useCase.execute('teacher-ana', 'teacher-ana', { deletePosts: true }),
    ).rejects.toMatchObject({
      details: { code: 'CANNOT_DELETE_SELF' },
      statusCode: 409,
    })
  })

  it('blocks deleting a teacher with posts unless deletePosts is true', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)
    const useCase = new DeleteUserUseCase(
      repository,
      makePostsRepository(3),
      'professor',
    )

    await expect(
      useCase.execute('teacher-bruno', 'teacher-ana', { deletePosts: false }),
    ).rejects.toMatchObject({
      details: { code: 'TEACHER_HAS_POSTS', postsCount: 3 },
      message: 'Professor possui 3 posts publicados',
      statusCode: 409,
    })
    expect(await repository.findById('teacher-bruno')).not.toBeNull()

    await useCase.execute('teacher-bruno', 'teacher-ana', {
      deletePosts: true,
    })
    expect(await repository.findById('teacher-bruno')).toBeNull()
  })

  it('deletes a student directly', async () => {
    const repository = new InMemoryUserRepository()
    await seedUsers(repository)

    await new DeleteUserUseCase(
      repository,
      makePostsRepository(0),
      'aluno',
    ).execute('student-carla', 'teacher-ana', { deletePosts: false })

    expect(await repository.findById('student-carla')).toBeNull()
  })
})

describe('GetProfileUseCase', () => {
  it('returns 401 when the token user no longer exists', async () => {
    await expect(
      new GetProfileUseCase(new InMemoryUserRepository()).execute('missing'),
    ).rejects.toEqual(new AppError('Não autorizado', 401))
  })
})
