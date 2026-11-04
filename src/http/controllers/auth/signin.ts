import { type NextFunction, type Request, type Response } from 'express'
import { ZodError } from 'zod'

import { AppError } from '../../../errors/app-error'
import { signInSchema } from '../../../schemas/auth.schema'
import { makeSigninUseCase } from '../../../use-cases/factory/make-signin-use-case'
import { serializeUser } from '../users/user-response'

export async function signin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = signInSchema.parse(request.body)
    const signinUseCase = makeSigninUseCase()
    const { accessToken, tokenType, user } = await signinUseCase.execute(
      email,
      password,
    )

    response.status(200).json({
      access_token: accessToken,
      token_type: tokenType,
      user: serializeUser(user),
    })
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError('Dados da requisição inválidos', 400))
      return
    }

    next(error)
  }
}
