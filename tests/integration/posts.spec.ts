import jwt from 'jsonwebtoken'
import request from 'supertest'

import { app } from '../../src/app'
import { env } from '../../src/env'

describe('posts HTTP flow', () => {
  it('rejects a search without a query', async () => {
    const response = await request(app).get('/posts/search')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Dados da requisição inválidos' })
  })

  it('rejects post creation without a Bearer token', async () => {
    const response = await request(app).post('/posts').send({
      content: 'Post content',
      title: 'Post title',
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Não autorizado' })
  })

  it('rejects a malformed (non-UUID) post id with 400', async () => {
    const response = await request(app).get('/posts/not-a-uuid')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Dados da requisição inválidos' })
  })

  it('validates the post body before repository access', async () => {
    const token = jwt.sign(
      { role: 'professor', sub: 'author-id' },
      env.JWT_SECRET,
    )
    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Dados da requisição inválidos' })
  })
})
