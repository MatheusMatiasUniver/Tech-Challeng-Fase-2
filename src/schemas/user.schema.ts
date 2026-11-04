import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(6).max(72),
})

export const updateUserSchema = createUserSchema
  .partial()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.email !== undefined ||
      data.password !== undefined,
    { message: 'Informe ao menos um campo para atualização' },
  )

// O teto de 50 por pagina evita que um cliente peca a tabela inteira.
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const deleteUserQuerySchema = z.object({
  deletePosts: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

export const userIdSchema = z.string().uuid()
