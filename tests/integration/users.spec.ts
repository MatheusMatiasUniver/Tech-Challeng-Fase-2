import jwt from 'jsonwebtoken'
import request from 'supertest'

import { app } from '../../src/app'
import { env } from '../../src/env'

const teacherToken = jwt.sign(
  { role: 'professor', sub: '7d204c96-cb9a-4fa9-bae6-0d0cfb5d8d46' },
  env.JWT_SECRET,
)
const studentToken = jwt.sign(
  { role: 'aluno', sub: 'b0f7e1a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b' },
  env.JWT_SECRET,
)

describe.each(['/teachers', '/students'])('%s HTTP flow', (basePath) => {
  it('rejects requests without a Bearer token', async () => {
    const response = await request(app).get(basePath)

    expect(response.status).toBe(401)
  })

  it('rejects students with 403', async () => {
    const response = await request(app)
      .get(basePath)
      .set('Authorization', `Bearer ${studentToken}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ message: 'Acesso restrito a professores' })
  })

  it('rejects a limit above 50 before repository access', async () => {
    const response = await request(app)
      .get(`${basePath}?limit=51`)
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(response.status).toBe(400)
  })

  it('rejects a malformed id with 400', async () => {
    const response = await request(app)
      .get(`${basePath}/not-a-uuid`)
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(response.status).toBe(400)
  })

  it('validates the body on create before repository access', async () => {
    const response = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ email: 'invalid', name: '', password: '123' })

    expect(response.status).toBe(400)
  })
})

describe('posts write permissions', () => {
  it('rejects post creation by a student with 403', async () => {
    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ content: 'Conteúdo', title: 'Título' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ message: 'Acesso restrito a professores' })
  })
})
