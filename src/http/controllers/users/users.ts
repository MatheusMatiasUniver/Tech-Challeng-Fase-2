import { type NextFunction, type Request, type Response } from 'express'
import { ZodError } from 'zod'

import { type UserRole } from '../../../entities/user.entity'
import { AppError } from '../../../errors/app-error'
import {
  createUserSchema,
  deleteUserQuerySchema,
  paginationSchema,
  updateUserSchema,
  userIdSchema,
} from '../../../schemas/user.schema'
import {
  makeCreateUserUseCase,
  makeDeleteUserUseCase,
  makeGetUserUseCase,
  makeListUsersUseCase,
  makeUpdateUserUseCase,
} from '../../../use-cases/factory/make-user-use-cases'
import { serializeUser } from './user-response'

type Handler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>

export interface UsersController {
  create: Handler
  get: Handler
  list: Handler
  remove: Handler
  update: Handler
}

function forwardError(error: unknown, next: NextFunction): void {
  if (error instanceof ZodError) {
    next(new AppError('Dados da requisição inválidos', 400))
    return
  }

  next(error)
}

function getRequesterId(request: Request): string {
  if (request.userId === undefined) {
    throw new AppError('Não autorizado', 401)
  }

  return request.userId
}

// Professores e alunos usam os mesmos handlers; so muda o papel.
export function makeUsersController(role: UserRole): UsersController {
  return {
    async list(request, response, next) {
      try {
        const pagination = paginationSchema.parse(request.query)
        const { data, meta } =
          await makeListUsersUseCase(role).execute(pagination)

        response.status(200).json({ data: data.map(serializeUser), meta })
      } catch (error) {
        forwardError(error, next)
      }
    },

    async get(request, response, next) {
      try {
        const user = await makeGetUserUseCase(role).execute(
          userIdSchema.parse(request.params.id),
        )

        response.status(200).json(serializeUser(user))
      } catch (error) {
        forwardError(error, next)
      }
    },

    async create(request, response, next) {
      try {
        const data = createUserSchema.parse(request.body)
        const user = await makeCreateUserUseCase(role).execute(data)

        response.status(201).json(serializeUser(user))
      } catch (error) {
        forwardError(error, next)
      }
    },

    async update(request, response, next) {
      try {
        const id = userIdSchema.parse(request.params.id)
        const data = updateUserSchema.parse(request.body)
        const user = await makeUpdateUserUseCase(role).execute(id, data)

        response.status(200).json(serializeUser(user))
      } catch (error) {
        forwardError(error, next)
      }
    },

    async remove(request, response, next) {
      try {
        const id = userIdSchema.parse(request.params.id)
        const { deletePosts } = deleteUserQuerySchema.parse(request.query)

        await makeDeleteUserUseCase(role).execute(id, getRequesterId(request), {
          deletePosts,
        })

        response.status(204).send()
      } catch (error) {
        forwardError(error, next)
      }
    },
  }
}
