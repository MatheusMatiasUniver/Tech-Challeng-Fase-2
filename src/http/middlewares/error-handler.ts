import { type ErrorRequestHandler } from 'express'

import { AppError } from '../../errors/app-error'

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response
      .status(error.statusCode)
      .json({ message: error.message, ...error.details })
    return
  }

  console.error(error)
  response.status(500).json({ message: 'Erro interno do servidor' })
}
