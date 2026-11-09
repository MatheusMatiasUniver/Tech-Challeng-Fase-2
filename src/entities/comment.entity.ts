import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Post } from './post.entity'
import { User } from './user.entity'

// Comentario de um usuario logado (professor ou aluno) em um post.
//
// As duas FKs usam CASCADE, ao contrario de posts.autor_id (RESTRICT): o
// comentario so faz sentido junto do post e da pessoa. Excluir um post leva
// os comentarios dele, e excluir um aluno leva os comentarios do aluno, sem
// um passo de confirmacao como o TEACHER_HAS_POSTS.
@Entity('comments')
@Index('IDX_comments_post_id_created_at', ['postId', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'conteudo', type: 'text' })
  content!: string

  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string

  @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post

  @Column({ name: 'autor_id', type: 'uuid' })
  authorId!: string

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'autor_id' })
  author!: User

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
