import { z } from 'zod'

// Limite para comentario nao virar um segundo post.
export const COMMENT_MAX_LENGTH = 1000

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
})

export const commentIdSchema = z.string().uuid()
