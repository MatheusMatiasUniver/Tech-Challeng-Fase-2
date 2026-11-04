import { Router } from 'express'

import { jwtValidate } from '../../middlewares/jwt-validate'
import { requireRole } from '../../middlewares/require-role'
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  searchPosts,
  updatePost,
} from './posts'

export const postsRoutes = Router()

postsRoutes.get('/', listPosts)
postsRoutes.get('/search', searchPosts)
postsRoutes.get('/:id', getPost)
// Leitura e publica; escrever exige ser professor (alunos so visualizam).
const teacherOnly = [jwtValidate, requireRole('professor')]

postsRoutes.post('/', ...teacherOnly, createPost)
postsRoutes.put('/:id', ...teacherOnly, updatePost)
postsRoutes.delete('/:id', ...teacherOnly, deletePost)
