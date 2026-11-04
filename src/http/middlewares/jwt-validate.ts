import { type NextFunction, type Request, type Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'

import { USER_ROLES, type UserRole } from '../../entities/user.entity'
import { env } from '../../env'
import { AppError } from '../../errors/app-error'

export function jwtValidate(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorization = request.headers.authorization

  if (authorization === undefined) {
    next(new AppError('Não autorizado', 401))
    return
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
    next(new AppError('Não autorizado', 401))
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)

    if (typeof payload === 'string' || payload.sub === undefined) {
      next(new AppError('Não autorizado', 401))
      return
    }

    const { role, sub } = payload as JwtPayload & { role?: unknown }

    // Tokens emitidos antes da existencia de papeis nao trazem `role`. Eles
    // sao recusados e o usuario so precisa fazer login de novo.
    if (!isUserRole(role)) {
      next(new AppError('Não autorizado', 401))
      return
    }

    request.userId = sub
    request.userRole = role
    next()
  } catch {
    next(new AppError('Não autorizado', 401))
  }
}

function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.includes(value as UserRole)
}
