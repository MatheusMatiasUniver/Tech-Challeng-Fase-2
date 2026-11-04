import { AppError } from '../../src/errors/app-error'
import { type PostRepositoryInterface } from '../../src/repositories/post-repository.interface'
import { DeletePostUseCase } from '../../src/use-cases/posts/delete-post'

const post = {
  authorId: 'author-id',
  id: 'post-id',
}

function makeRepository(
  findById: PostRepositoryInterface['findById'],
  deletePost: PostRepositoryInterface['delete'],
): PostRepositoryInterface {
  return {
    countByAuthor: async () => 0,
    create: async () => {
      throw new Error('Não implementado')
    },
    delete: deletePost,
    findAll: async () => [],
    findById,
    search: async () => [],
    update: async () => null,
  }
}

describe('DeletePostUseCase', () => {
  it('returns 404 when the post does not exist', async () => {
    const deletePost = jest.fn(async () => undefined)
    const useCase = new DeletePostUseCase(
      makeRepository(async () => null, deletePost),
    )

    await expect(useCase.execute('missing', 'author-id')).rejects.toEqual(
      new AppError('Post não encontrado', 404),
    )
    expect(deletePost).not.toHaveBeenCalled()
  })

  it('returns 403 when the authenticated user is not the author', async () => {
    const deletePost = jest.fn(async () => undefined)
    const useCase = new DeletePostUseCase(
      makeRepository(async () => post as never, deletePost),
    )

    await expect(useCase.execute(post.id, 'other-author')).rejects.toEqual(
      new AppError('Acesso proibido', 403),
    )
    expect(deletePost).not.toHaveBeenCalled()
  })

  it('deletes the post when the authenticated user is the author', async () => {
    const deletePost = jest.fn(async () => undefined)
    const useCase = new DeletePostUseCase(
      makeRepository(async () => post as never, deletePost),
    )

    await expect(
      useCase.execute(post.id, post.authorId),
    ).resolves.toBeUndefined()
    expect(deletePost).toHaveBeenCalledWith(post.id)
  })
})
