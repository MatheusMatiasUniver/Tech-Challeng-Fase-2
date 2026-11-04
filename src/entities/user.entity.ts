import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Post } from './post.entity'

export const USER_ROLES = ['professor', 'aluno'] as const

export type UserRole = (typeof USER_ROLES)[number]

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'nome', type: 'varchar', length: 150 })
  name!: string

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ name: 'senha_hash', type: 'varchar', length: 255 })
  passwordHash!: string

  @Column({ name: 'papel', type: 'varchar', length: 20 })
  role!: UserRole

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[]
}
