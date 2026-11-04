import 'dotenv/config'
import { z } from 'zod'

export const envSchema = z.object({
  // Origens liberadas para navegadores, separadas por virgula (ex.: Expo web
  // em http://localhost:8081). Vazio mantem o comportamento sem CORS. Apps
  // nativos (Android/iOS) nao passam por CORS.
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  DATABASE_HOST: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive(),
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DATABASE_USER: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default('1h'),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
