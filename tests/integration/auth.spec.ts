import express from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import { app } from '../../src/app'
import { env } from '../../src/env'
import { errorHandler } from '../../src/http/middlewares/error-handler'
import { jwtValidate } from '../../src/http/middlewares/jwt-validate'
import { requireRole } from '../../src/http/middlewares/require-role'

describe('authentication HTTP flow', () => {
  it('returns 400 when login body is invalid', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid', password: '' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Dados da requisição inválidos' })
  })

  it('rejects a protected route without a Bearer token', async () => {
    const protectedApp = express()

    protectedApp.get('/protected', jwtValidate, (req, res) => {
      res.status(200).json({ userId: req.userId })
    })
    protectedApp.use(errorHandler)

    const response = await request(protectedApp).get('/protected')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Não autorizado' })
  })

  it('accepts a valid Bearer token on a protected route', async () => {
    const protectedApp = express()
    const userId = '7d204c96-cb9a-4fa9-bae6-0d0cfb5d8d46'

    protectedApp.get('/protected', jwtValidate, (req, res) => {
      res.status(200).json({ userId: req.userId, userRole: req.userRole })
    })
    protectedApp.use(errorHandler)

    const token = jwt.sign({ role: 'aluno', sub: userId }, env.JWT_SECRET)
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ userId, userRole: 'aluno' })
  })

  it('rejects a token issued before roles existed (no role claim)', async () => {
    const protectedApp = express()

    protectedApp.get('/protected', jwtValidate, (_req, res) => {
      res.status(200).send()
    })
    protectedApp.use(errorHandler)

    const token = jwt.sign({ sub: 'user-id' }, env.JWT_SECRET)
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
  })

  it('requireRole returns 403 for a student on a teacher-only route', async () => {
    const protectedApp = express()

    protectedApp.get(
      '/teachers-only',
      jwtValidate,
      requireRole('professor'),
      (_req, res) => {
        res.status(200).send()
      },
    )
    protectedApp.use(errorHandler)

    const studentToken = jwt.sign(
      { role: 'aluno', sub: 'student-id' },
      env.JWT_SECRET,
    )
    const teacherToken = jwt.sign(
      { role: 'professor', sub: 'teacher-id' },
      env.JWT_SECRET,
    )

    const forbidden = await request(protectedApp)
      .get('/teachers-only')
      .set('Authorization', `Bearer ${studentToken}`)
    const allowed = await request(protectedApp)
      .get('/teachers-only')
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(forbidden.status).toBe(403)
    expect(forbidden.body).toEqual({ message: 'Acesso restrito a professores' })
    expect(allowed.status).toBe(200)
  })

  it('rejects GET /auth/me without a token', async () => {
    const response = await request(app).get('/auth/me')

    expect(response.status).toBe(401)
  })
})
