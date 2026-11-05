import { type Comment } from '../../entities/comment.entity'
import { type CommentRepositoryInterface } from '../../repositories/comment-repository.interface'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'
import { GetPostUseCase } from '../posts/get-post'

export class ListCommentsUseCase {
  private readonly getPost: GetPostUseCase

  constructor(
    private readonly commentsRepository: CommentRepositoryInterface,
    postsRepository: PostRepositoryInterface,
  ) {
    this.getPost = new GetPostUseCase(postsRepository)
  }

  // Post inexistente responde 404, e nao uma lista vazia, para o cliente
  // diferenciar "sem comentarios" de "post apagado".
  async execute(postId: string): Promise<Comment[]> {
    await this.getPost.execute(postId)

    return this.commentsRepository.findByPost(postId)
  }
}
