import { type NextFunction, type Request, type Response } from 'express'
import { ZodError } from 'zod'

import { AppError } from '../../../errors/app-error'
import {
  commentIdSchema,
  createCommentSchema,
} from '../../../schemas/comment.schema'
import { postIdSchema } from '../../../schemas/post.schema'
import {
  makeCreateCommentUseCase,
  makeDeleteCommentUseCase,
  makeListCommentsUseCase,
} from '../../../use-cases/factory/make-comment-use-cases'
import { serializeComment } from './comment-response'

function forwardError(error: unknown, next: NextFunction): void {
  if (error instanceof ZodError) {
    next(new AppError('Dados da requisição inválidos', 400))
    return
  }

  next(error)
}

function getAuthenticatedUserId(request: Request): string {
  if (request.userId === undefined) {
    throw new AppError('Não autorizado', 401)
  }

  return request.userId
}

// As rotas ficam em /posts/:postId/comments (Router com mergeParams).
function getPostId(request: Request): string {
  return postIdSchema.parse(request.params.postId)
}

export async function listComments(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const comments = await makeListCommentsUseCase().execute(getPostId(request))

    response.status(200).json(comments.map(serializeComment))
  } catch (error) {
    forwardError(error, next)
  }
}

export async function createComment(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const postId = getPostId(request)
    const { content } = createCommentSchema.parse(request.body)
    const comment = await makeCreateCommentUseCase().execute({
      authorId: getAuthenticatedUserId(request),
      content,
      postId,
    })

    response.status(201).json(serializeComment(comment))
  } catch (error) {
    forwardError(error, next)
  }
}

export async function deleteComment(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await makeDeleteCommentUseCase().execute(
      getPostId(request),
      commentIdSchema.parse(request.params.commentId),
      getAuthenticatedUserId(request),
    )

    response.status(204).send()
  } catch (error) {
    forwardError(error, next)
  }
}
