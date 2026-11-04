import { Post } from '../entities/post.entity'

export interface CreatePostData {
  authorId: string
  content: string
  title: string
}

export interface UpdatePostData {
  content?: string
  title?: string
}

export interface PostRepositoryInterface {
  countByAuthor(authorId: string): Promise<number>
  create(data: CreatePostData): Promise<Post>
  delete(id: string): Promise<void>
  findAll(): Promise<Post[]>
  findById(id: string): Promise<Post | null>
  search(query: string): Promise<Post[]>
  update(id: string, data: UpdatePostData): Promise<Post | null>
}
