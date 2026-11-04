import { type NextFunction, type Request, type Response } from 'express'

import { AppError } from '../../../errors/app-error'
import { makeGetProfileUseCase } from '../../../use-cases/factory/make-user-use-cases'
import { serializeUser } from '../users/user-response'

export async function me(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (request.userId === undefined) {
      throw new AppError('Não autorizado', 401)
    }

    const user = await makeGetProfileUseCase().execute(request.userId)

    response.status(200).json(serializeUser(user))
  } catch (error) {
    next(error)
  }
}
