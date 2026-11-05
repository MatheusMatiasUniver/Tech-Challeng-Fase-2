import { type Comment } from '../../entities/comment.entity'
import { type CommentRepositoryInterface } from '../../repositories/comment-repository.interface'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'
import { GetPostUseCase } from '../posts/get-post'

export interface CreateCommentInput {
  authorId: string
  content: string
  postId: string
}

export class CreateCommentUseCase {
  private readonly getPost: GetPostUseCase

  constructor(
    private readonly commentsRepository: CommentRepositoryInterface,
    postsRepository: PostRepositoryInterface,
  ) {
    this.getPost = new GetPostUseCase(postsRepository)
  }

  // Qualquer usuario logado comenta (professor ou aluno); o autor e sempre
  // o dono do token, nunca um campo do corpo.
  async execute(input: CreateCommentInput): Promise<Comment> {
    await this.getPost.execute(input.postId)

    return this.commentsRepository.create(input)
  }
}
