import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/password-service'
export const authorizationToken = (req: Request, res: Response, next: NextFunction): void => {
  const accessToken = req.headers.authorization?.replace(/Bearer\s/, '')
  if (!accessToken) {
    return next()
  }

  const token = verifyToken(accessToken)
  if (token.decoded) {
    // memanggil user yang sedang login
    res.locals.user = token.decoded
    return next()
  }

  if (token.expired) {
    next()
  }

  return next()
}
