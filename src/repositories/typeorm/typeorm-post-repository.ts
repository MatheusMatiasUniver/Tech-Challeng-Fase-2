import { AppDataSource } from '../../database/data-source'
import { Post } from '../../entities/post.entity'
import {
  type CreatePostData,
  type PostRepositoryInterface,
  type UpdatePostData,
} from '../post-repository.interface'

export class TypeOrmPostRepository implements PostRepositoryInterface {
  private readonly repository = AppDataSource.getRepository(Post)

  async countByAuthor(authorId: string): Promise<number> {
    return this.repository.countBy({ authorId })
  }

  async create(data: CreatePostData): Promise<Post> {
    const post = this.repository.create(data)

    return this.repository.save(post)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async findAll(): Promise<Post[]> {
    return this.repository.find({
      relations: { author: true },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string): Promise<Post | null> {
    return this.repository.findOne({
      where: { id },
      relations: { author: true },
    })
  }

  async search(query: string): Promise<Post[]> {
    return this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.titulo ILIKE :query', { query: `%${query}%` })
      .orWhere('post.conteudo ILIKE :query', { query: `%${query}%` })
      .orderBy('post.created_at', 'DESC')
      .getMany()
  }

  async update(id: string, data: UpdatePostData): Promise<Post | null> {
    await this.repository.update(id, data)

    return this.findById(id)
  }
}
