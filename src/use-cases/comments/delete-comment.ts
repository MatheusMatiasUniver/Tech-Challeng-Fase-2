import { AppError } from '../../errors/app-error'
import { type CommentRepositoryInterface } from '../../repositories/comment-repository.interface'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'
import { GetPostUseCase } from '../posts/get-post'

export class DeleteCommentUseCase {
  private readonly getPost: GetPostUseCase

  constructor(
    private readonly commentsRepository: CommentRepositoryInterface,
    postsRepository: PostRepositoryInterface,
  ) {
    this.getPost = new GetPostUseCase(postsRepository)
  }

  // Pode excluir: quem escreveu o comentario ou o professor autor do post
  // (moderacao do proprio conteudo). Segue a regra dos posts, em que cada
  // professor cuida so do que e dele.
  async execute(
    postId: string,
    commentId: string,
    requesterId: string,
  ): Promise<void> {
    const post = await this.getPost.execute(postId)
    const comment = await this.commentsRepository.findById(commentId)

    // Comentario de outro post tambem e 404: a URL nao bate com o recurso.
    if (comment === null || comment.postId !== postId) {
      throw new AppError('Comentário não encontrado', 404)
    }

    if (comment.authorId !== requesterId && post.authorId !== requesterId) {
      throw new AppError('Acesso proibido', 403)
    }

    await this.commentsRepository.delete(commentId)
  }
}
