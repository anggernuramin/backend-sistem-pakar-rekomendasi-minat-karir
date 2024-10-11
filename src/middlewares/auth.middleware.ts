import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../helpers/apiResponse'
// membatasi hak aksek endpont untuk client dan admin
export const requireClient = (req: Request, res: Response, next: NextFunction): void => {
  const user = res.locals.user
  if (!user) {
    errorResponse(res, 401, 'For Bidden || Anda harus login terlebih dahulu')
    return
  }

  return next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // mengambil user yang sedang login(yaitu valuenya mengambil value dari headers token jwt)
  const user = res.locals.user
  //   handle error ketika user tidak punya token
  if (!user) {
    errorResponse(res, 401, 'For Bidden || Anda harus login terlebih dahulu')
    return
  }

  if (!user || user.role !== 'admin') {
    errorResponse(res, 401, 'Role Token anda bukan admin, anda harus login sebagai admin')
    return
  }

  return next()
}
