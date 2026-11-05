import { AppError } from '../../src/errors/app-error'
import { type CommentRepositoryInterface } from '../../src/repositories/comment-repository.interface'
import { type PostRepositoryInterface } from '../../src/repositories/post-repository.interface'
import { CreateCommentUseCase } from '../../src/use-cases/comments/create-comment'
import { DeleteCommentUseCase } from '../../src/use-cases/comments/delete-comment'
import { ListCommentsUseCase } from '../../src/use-cases/comments/list-comments'

const post = { authorId: 'teacher-id', id: 'post-id' }
const comment = {
  authorId: 'student-id',
  content: 'Gostei da aula',
  id: 'comment-id',
  postId: post.id,
}

function makePosts(found: boolean): PostRepositoryInterface {
  return {
    countByAuthor: async () => 0,
    create: async () => {
      throw new Error('Não implementado')
    },
    delete: async () => undefined,
    findAll: async () => [],
    findById: async () => (found ? (post as never) : null),
    search: async () => [],
    update: async () => null,
  }
}

function makeComments(
  overrides: Partial<CommentRepositoryInterface> = {},
): CommentRepositoryInterface {
  return {
    create: jest.fn(async (data) => ({ ...comment, ...data }) as never),
    delete: jest.fn(async () => undefined),
    findById: jest.fn(async () => comment as never),
    findByPost: jest.fn(async () => [comment as never]),
    ...overrides,
  }
}

describe('ListCommentsUseCase', () => {
  it('returns 404 when the post does not exist', async () => {
    const comments = makeComments()
    const useCase = new ListCommentsUseCase(comments, makePosts(false))

    await expect(useCase.execute('missing')).rejects.toEqual(
      new AppError('Post não encontrado', 404),
    )
    expect(comments.findByPost).not.toHaveBeenCalled()
  })

  it('lists the comments of an existing post', async () => {
    const useCase = new ListCommentsUseCase(makeComments(), makePosts(true))

    await expect(useCase.execute(post.id)).resolves.toEqual([comment])
  })
})

describe('CreateCommentUseCase', () => {
  it('returns 404 when the post does not exist', async () => {
    const comments = makeComments()
    const useCase = new CreateCommentUseCase(comments, makePosts(false))

    await expect(
      useCase.execute({ authorId: 'student-id', content: 'Oi', postId: 'x' }),
    ).rejects.toEqual(new AppError('Post não encontrado', 404))
    expect(comments.create).not.toHaveBeenCalled()
  })

  it('creates the comment with the token owner as author', async () => {
    const comments = makeComments()
    const useCase = new CreateCommentUseCase(comments, makePosts(true))
    const input = { authorId: 'student-id', content: 'Oi', postId: post.id }

    await useCase.execute(input)

    expect(comments.create).toHaveBeenCalledWith(input)
  })
})

describe('DeleteCommentUseCase', () => {
  it('returns 404 when the comment belongs to another post', async () => {
    const comments = makeComments({
      findById: async () => ({ ...comment, postId: 'other-post' }) as never,
    })
    const useCase = new DeleteCommentUseCase(comments, makePosts(true))

    await expect(
      useCase.execute(post.id, comment.id, comment.authorId),
    ).rejects.toEqual(new AppError('Comentário não encontrado', 404))
    expect(comments.delete).not.toHaveBeenCalled()
  })

  it('returns 403 for someone who is neither comment nor post author', async () => {
    const comments = makeComments()
    const useCase = new DeleteCommentUseCase(comments, makePosts(true))

    await expect(
      useCase.execute(post.id, comment.id, 'other-student'),
    ).rejects.toEqual(new AppError('Acesso proibido', 403))
    expect(comments.delete).not.toHaveBeenCalled()
  })

  it.each([
    ['the comment author', comment.authorId],
    ['the post author', post.authorId],
  ])('lets %s delete the comment', async (_label, requesterId) => {
    const comments = makeComments()
    const useCase = new DeleteCommentUseCase(comments, makePosts(true))

    await useCase.execute(post.id, comment.id, requesterId)

    expect(comments.delete).toHaveBeenCalledWith(comment.id)
  })
})
