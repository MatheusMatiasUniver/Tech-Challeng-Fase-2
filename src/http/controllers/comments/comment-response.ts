import { type Comment } from '../../../entities/comment.entity'

// O autor vai sem e-mail: a lista e publica e inclui alunos, entao expor o
// e-mail deles para qualquer visitante seria vazar dado pessoal. O papel vai
// junto para o app destacar quando quem comentou e professor.
export function serializeComment(comment: Comment): object {
  return {
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    authorId: comment.authorId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author:
      comment.author === undefined
        ? undefined
        : {
            id: comment.author.id,
            name: comment.author.name,
            role: comment.author.role,
          },
  }
}
