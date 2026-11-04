import { type UserRole } from '../../entities/user.entity'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: UserRole
    }
  }
}

export {}
