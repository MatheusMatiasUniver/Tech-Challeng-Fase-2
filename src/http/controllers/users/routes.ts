import { Router } from 'express'

import { type UserRole } from '../../../entities/user.entity'
import { jwtValidate } from '../../middlewares/jwt-validate'
import { requireRole } from '../../middlewares/require-role'
import { makeUsersController } from './users'

// Todas as rotas de gestao de pessoas sao restritas a professores.
function makeUsersRoutes(role: UserRole): Router {
  const controller = makeUsersController(role)
  const router = Router()

  router.use(jwtValidate, requireRole('professor'))

  router.get('/', controller.list)
  router.get('/:id', controller.get)
  router.post('/', controller.create)
  router.put('/:id', controller.update)
  router.delete('/:id', controller.remove)

  return router
}

export const teachersRoutes = makeUsersRoutes('professor')
export const studentsRoutes = makeUsersRoutes('aluno')
