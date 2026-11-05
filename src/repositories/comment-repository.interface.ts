import { Comment } from '../entities/comment.entity'

export interface CreateCommentData {
  authorId: string
  content: string
  postId: string
}

export interface CommentRepositoryInterface {
  // Devolve o comentario ja com o autor carregado.
  create(data: CreateCommentData): Promise<Comment>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Comment | null>
  // Comentarios do post do mais antigo para o mais novo, com autor.
  findByPost(postId: string): Promise<Comment[]>
}
