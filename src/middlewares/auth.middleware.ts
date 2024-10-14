import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../helpers/apiResponse'
// Middleware to check if user has one of the allowed roles
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user

    if (!user) {
      errorResponse(res, 401, 'Token tidak valid || Anda harus login terlebih dahulu')
      return
    }

    // allowedRoles adalah array yang berisi daftar peran (roles) yang diizinkan untuk mengakses endpoint. Contohnya: ['admin', 'client'].
    // user.role adalah peran (role) dari pengguna yang sedang login. Informasi ini biasanya didapat dari token JWT yang telah diverifikasi dan disimpan dalam res.locals.user.
    if (!allowedRoles.includes(user.role)) {
      errorResponse(res, 403, 'Role anda tidak punya akses ke endpoint ini')
      return
    }

    next()
  }
}
