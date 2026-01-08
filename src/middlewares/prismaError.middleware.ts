import { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'

function prismaErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 400
    let message = 'Terjadi kesalahan pada permintaan.'

    switch (err.code) {
      case 'P2002': // Unique constraint failed
        statusCode = 409
        message = 'The request could not be completed due to a conflict.'
        break
      case 'P2001': // Record not found
        statusCode = 404
        message = 'We could not find the resource you requested.'
        break
      case 'P1001': // Database connection error
        statusCode = 500
        message = 'Database connection error. Please try again later.'
        break
      default:
        statusCode = 500
        message = 'Unexpected internal server error.'
    }

    return res.status(statusCode).json({ error: message })
  }

  // Jika error bukan dari Prisma, lanjutkan ke error handler berikutnya
  next(err)
}

export default prismaErrorHandler
