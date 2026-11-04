import { Router } from 'express'

import { jwtValidate } from '../../middlewares/jwt-validate'
import { me } from './me'
import { signin } from './signin'

export const authRoutes = Router()

authRoutes.post('/login', signin)
authRoutes.get('/me', jwtValidate, me)
