import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { AppError } from '../../src/errors/app-error'
import { type UserRepositoryInterface } from '../../src/repositories/user-repository.interface'
import { SigninUseCase } from '../../src/use-cases/auth/signin'

function makeRepository(
  findByEmail: UserRepositoryInterface['findByEmail'],
): UserRepositoryInterface {
  return {
    create: async () => {
      throw new Error('Não implementado')
    },
    delete: async () => undefined,
    findByEmail,
    findById: async () => null,
    findManyByRole: async () => ({ total: 0, users: [] }),
    update: async () => null,
  }
}

describe('SigninUseCase', () => {
  it('returns a Bearer token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('123456', 4)
    const user = {
      email: 'professor@fiap.com.br',
      id: '7d204c96-cb9a-4fa9-bae6-0d0cfb5d8d46',
      passwordHash,
      role: 'professor',
    }
    const usersRepository = makeRepository(async (email) =>
      email === user.email ? (user as never) : null,
    )
    const useCase = new SigninUseCase(usersRepository)

    const result = await useCase.execute(user.email, '123456')
    const payload = jwt.decode(result.accessToken)

    expect(result.tokenType).toBe('Bearer')
    expect(payload).toMatchObject({ role: 'professor', sub: user.id })
    expect(result.user).toBe(user)
  })

  it('rejects an unknown email with 401', async () => {
    const useCase = new SigninUseCase(makeRepository(async () => null))

    await expect(
      useCase.execute('missing@fiap.com.br', '123456'),
    ).rejects.toEqual(new AppError('Credenciais inválidas', 401))
  })

  it('rejects an invalid password with 401', async () => {
    const passwordHash = await bcrypt.hash('123456', 4)
    const usersRepository = makeRepository(
      async () =>
        ({
          id: '7d204c96-cb9a-4fa9-bae6-0d0cfb5d8d46',
          passwordHash,
        }) as never,
    )
    const useCase = new SigninUseCase(usersRepository)

    await expect(
      useCase.execute('professor@fiap.com.br', 'invalid'),
    ).rejects.toEqual(new AppError('Credenciais inválidas', 401))
  })
})
