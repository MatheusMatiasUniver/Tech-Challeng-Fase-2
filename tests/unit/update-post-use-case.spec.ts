import { AppError } from '../../src/errors/app-error'
import { type PostRepositoryInterface } from '../../src/repositories/post-repository.interface'
import { UpdatePostUseCase } from '../../src/use-cases/posts/update-post'

const post = {
  authorId: 'author-id',
  id: 'post-id',
}

function makeRepository(
  findById: PostRepositoryInterface['findById'],
  update: PostRepositoryInterface['update'],
): PostRepositoryInterface {
  return {
    countByAuthor: async () => 0,
    create: async () => {
      throw new Error('Não implementado')
    },
    delete: async () => undefined,
    findAll: async () => [],
    findById,
    search: async () => [],
    update,
  }
}

describe('UpdatePostUseCase', () => {
  it('returns 404 when the post does not exist', async () => {
    const useCase = new UpdatePostUseCase(
      makeRepository(
        async () => null,
        async () => null,
      ),
    )

    await expect(
      useCase.execute('missing', 'author-id', { title: 'Title' }),
    ).rejects.toEqual(new AppError('Post não encontrado', 404))
  })

  it('returns 403 when the authenticated user is not the author', async () => {
    const useCase = new UpdatePostUseCase(
      makeRepository(
        async () => post as never,
        async () => post as never,
      ),
    )

    await expect(
      useCase.execute(post.id, 'other-author', { title: 'Title' }),
    ).rejects.toEqual(new AppError('Acesso proibido', 403))
  })

  it('updates a post when the authenticated user is the author', async () => {
    const update = jest.fn(
      async () => ({ ...post, title: 'Updated title' }) as never,
    )
    const useCase = new UpdatePostUseCase(
      makeRepository(async () => post as never, update),
    )

    const result = await useCase.execute(post.id, post.authorId, {
      title: 'Updated title',
    })

    expect(update).toHaveBeenCalledWith(post.id, { title: 'Updated title' })
    expect(result.title).toBe('Updated title')
  })
})
