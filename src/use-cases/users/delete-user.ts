import { type UserRole } from '../../entities/user.entity'
import { AppError } from '../../errors/app-error'
import { type PostRepositoryInterface } from '../../repositories/post-repository.interface'
import { type UserRepositoryInterface } from '../../repositories/user-repository.interface'
import { GetUserUseCase } from './get-user'

export interface DeleteUserOptions {
  deletePosts: boolean
}

export class DeleteUserUseCase {
  private readonly getUser: GetUserUseCase

  constructor(
    private readonly usersRepository: UserRepositoryInterface,
    private readonly postsRepository: PostRepositoryInterface,
    role: UserRole,
  ) {
    this.getUser = new GetUserUseCase(usersRepository, role)
  }

  async execute(
    id: string,
    requesterId: string,
    { deletePosts }: DeleteUserOptions,
  ): Promise<void> {
    // Sem esta trava o unico professor poderia se excluir e ninguem mais
    // conseguiria entrar no painel.
    if (id === requesterId) {
      throw new AppError('Não é possível excluir a própria conta', 409, {
        code: 'CANNOT_DELETE_SELF',
      })
    }

    await this.getUser.execute(id)

    // Excluir o usuario apaga os posts dele (FK em cascata). Por isso a
    // exclusao so segue quando o cliente pede isso de forma explicita.
    const postsCount = await this.postsRepository.countByAuthor(id)

    if (postsCount > 0 && !deletePosts) {
      throw new AppError(
        `Professor possui ${postsCount} ${postsCount === 1 ? 'post publicado' : 'posts publicados'}`,
        409,
        { code: 'TEACHER_HAS_POSTS', postsCount },
      )
    }

    await this.usersRepository.delete(id)
  }
}
