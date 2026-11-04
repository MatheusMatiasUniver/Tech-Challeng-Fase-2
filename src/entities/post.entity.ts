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

import { User } from './user.entity'

@Entity('posts')
@Index('IDX_posts_autor_id', ['authorId'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'titulo', type: 'varchar', length: 255 })
  title!: string

  @Column({ name: 'conteudo', type: 'text' })
  content!: string

  @Column({ name: 'autor_id', type: 'uuid' })
  authorId!: string

  @ManyToOne(() => User, (user) => user.posts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'autor_id' })
  author!: User

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
