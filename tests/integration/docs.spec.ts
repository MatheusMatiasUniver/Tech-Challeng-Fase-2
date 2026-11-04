import request from 'supertest'

import { app } from '../../src/app'

describe('OpenAPI documentation', () => {
  it('exposes the OpenAPI document with the documented routes', async () => {
    const response = await request(app).get('/docs.json')

    expect(response.status).toBe(200)
    expect(response.body.openapi).toBe('3.0.3')
    expect(response.body.paths).toEqual(
      expect.objectContaining({
        '/auth/login': expect.any(Object),
        '/posts': expect.any(Object),
        '/posts/{id}': expect.any(Object),
        '/auth/me': expect.any(Object),
        '/teachers': expect.any(Object),
        '/teachers/{id}': expect.any(Object),
        '/students': expect.any(Object),
        '/students/{id}': expect.any(Object),
      }),
    )
    expect(response.body.components.securitySchemes.bearerAuth).toEqual(
      expect.objectContaining({ scheme: 'bearer', type: 'http' }),
    )
  })

  it('serves the Swagger UI', async () => {
    const response = await request(app).get('/docs/')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Swagger UI')
  })
})
