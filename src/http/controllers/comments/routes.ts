import { Router } from 'express'

import { jwtValidate } from '../../middlewares/jwt-validate'
import { requireUser } from '../../middlewares/require-user'
import { createComment, deleteComment, listComments } from './comments'

// mergeParams: o :postId vem do caminho montado em app.ts.
export const commentsRoutes = Router({ mergeParams: true })

// Ler comentarios e publico, como ler posts. Comentar exige login de
// qualquer papel: e a primeira escrita aberta a alunos.
const signedIn = [jwtValidate, requireUser()]

commentsRoutes.get('/', listComments)
commentsRoutes.post('/', ...signedIn, createComment)
commentsRoutes.delete('/:commentId', ...signedIn, deleteComment)
