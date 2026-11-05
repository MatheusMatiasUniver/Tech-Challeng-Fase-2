import { QueryFailedError } from 'typeorm'

import { AppDataSource } from '../../database/data-source'
import { Comment } from '../../entities/comment.entity'
import { AppError } from '../../errors/app-error'
import {
  type CommentRepositoryInterface,
  type CreateCommentData,
} from '../comment-repository.interface'

const FOREIGN_KEY_VIOLATION = '23503'

export class TypeOrmCommentRepository implements CommentRepositoryInterface {
  private readonly repository = AppDataSource.getRepository(Comment)

  async create(data: CreateCommentData): Promise<Comment> {
    try {
      const saved = await this.repository.save(this.repository.create(data))
      const comment = await this.findById(saved.id)

      return comment ?? saved
    } catch (error) {
      // O use-case ja confere o post, mas ele pode ser excluido entre a
      // checagem e o INSERT. A FK recusa e a resposta continua sendo 404.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION
      ) {
        throw new AppError('Post não encontrado', 404)
      }

      throw error
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async findById(id: string): Promise<Comment | null> {
    return this.repository.findOne({
      where: { id },
      relations: { author: true },
    })
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.repository.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'ASC', id: 'ASC' },
    })
  }
}
