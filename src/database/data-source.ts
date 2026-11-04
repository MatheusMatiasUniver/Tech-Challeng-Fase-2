import 'reflect-metadata'
import { DataSource } from 'typeorm'

import { CreateUsers1710000000000 } from './migrations/1710000000000-create-users'
import { CreatePosts1710000001000 } from './migrations/1710000001000-create-posts'
import { AddUuidDefaults1710000002000 } from './migrations/1710000002000-add-uuid-defaults'
import { AddUserRole1710000003000 } from './migrations/1710000003000-add-user-role'
import { Post } from '../entities/post.entity'
import { User } from '../entities/user.entity'
import { env } from '../env'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  entities: [User, Post],
  migrations: [
    CreateUsers1710000000000,
    CreatePosts1710000001000,
    AddUuidDefaults1710000002000,
    AddUserRole1710000003000,
  ],
  migrationsRun: false,
  synchronize: false,
})
