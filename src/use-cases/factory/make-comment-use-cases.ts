import { TypeOrmCommentRepository } from '../../repositories/typeorm/typeorm-comment-repository'
import { TypeOrmPostRepository } from '../../repositories/typeorm/typeorm-post-repository'
import { CreateCommentUseCase } from '../comments/create-comment'
import { DeleteCommentUseCase } from '../comments/delete-comment'
import { ListCommentsUseCase } from '../comments/list-comments'

export function makeListCommentsUseCase(): ListCommentsUseCase {
  return new ListCommentsUseCase(
    new TypeOrmCommentRepository(),
    new TypeOrmPostRepository(),
  )
}

export function makeCreateCommentUseCase(): CreateCommentUseCase {
  return new CreateCommentUseCase(
    new TypeOrmCommentRepository(),
    new TypeOrmPostRepository(),
  )
}

export function makeDeleteCommentUseCase(): DeleteCommentUseCase {
  return new DeleteCommentUseCase(
    new TypeOrmCommentRepository(),
    new TypeOrmPostRepository(),
  )
}
