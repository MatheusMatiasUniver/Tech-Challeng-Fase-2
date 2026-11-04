import { randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'

import { AppDataSource } from '../data-source'
import { type UserRole } from '../../entities/user.entity'
import { TypeOrmUserRepository } from '../../repositories/typeorm/typeorm-user-repository'

interface SeedUser {
  name: string
  email: string
  password: string
  role: UserRole
}

const seedUsers: SeedUser[] = [
  {
    name: 'Professor',
    email: 'professor@exemplo.com',
    password: '123456',
    role: 'professor',
  },
  {
    name: 'Professor 1',
    email: 'professor1@exemplo.com',
    password: '123456',
    role: 'professor',
  },
  {
    name: 'Professor 2',
    email: 'professor2@exemplo.com',
    password: '123456',
    role: 'professor',
  },
  {
    name: 'Aluno 1',
    email: 'aluno1@exemplo.com',
    password: '123456',
    role: 'aluno',
  },
  {
    name: 'Aluno 2',
    email: 'aluno2@exemplo.com',
    password: '123456',
    role: 'aluno',
  },
]

async function seed(): Promise<void> {
  await AppDataSource.initialize()

  try {
    const usersRepository = new TypeOrmUserRepository()

    for (const user of seedUsers) {
      const existingUser = await usersRepository.findByEmail(user.email)

      if (existingUser !== null) {
        continue
      }

      const passwordHash = await bcrypt.hash(user.password, 12)

      await usersRepository.create({
        email: user.email,
        id: randomUUID(),
        name: user.name,
        passwordHash,
        role: user.role,
      })
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

seed().catch((error: unknown) => {
  console.error('Falha ao popular o banco de dados', error)
  process.exitCode = 1
})
