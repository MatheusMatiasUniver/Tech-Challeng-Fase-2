import jwt from 'jsonwebtoken'
import request from 'supertest'

import { app } from '../../src/app'
import { env } from '../../src/env'

const POST_ID = '7f8b1c2a-1111-4c3d-9e4f-123456789abc'

// Sem banco: o requireUser so encontra o usuario 'student-id'.
jest.mock('../../src/repositories/typeorm/typeorm-user-repository', () => ({
  TypeOrmUserRepository: jest.fn().mockImplementation(() => ({
    findById: async (id: string) =>
      id === 'student-id' ? { id, role: 'aluno' } : null,
  })),
}))

function tokenFor(sub: string, role = 'aluno'): string {
  return jwt.sign({ role, sub }, env.JWT_SECRET)
}

describe('comments HTTP flow', () => {
  it('rejects a malformed post id with 400', async () => {
    const response = await request(app).get('/posts/not-a-uuid/comments')

    expect(response.status).toBe(400)
  })

  it('rejects commenting without a Bearer token', async () => {
    const response = await request(app)
      .post(`/posts/${POST_ID}/comments`)
      .send({ content: 'Oi' })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Não autorizado' })
  })

  it('rejects a token whose user no longer exists', async () => {
    const response = await request(app)
      .post(`/posts/${POST_ID}/comments`)
      .set('Authorization', `Bearer ${tokenFor('deleted-id')}`)
      .send({ content: 'Oi' })

    expect(response.status).toBe(401)
  })

  it('validates the comment body before repository access', async () => {
    const response = await request(app)
      .post(`/posts/${POST_ID}/comments`)
      .set('Authorization', `Bearer ${tokenFor('student-id')}`)
      .send({ content: '   ' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Dados da requisição inválidos' })
  })

  it('rejects a malformed comment id on delete', async () => {
    const response = await request(app)
      .delete(`/posts/${POST_ID}/comments/not-a-uuid`)
      .set('Authorization', `Bearer ${tokenFor('student-id')}`)

    expect(response.status).toBe(400)
  })
})
