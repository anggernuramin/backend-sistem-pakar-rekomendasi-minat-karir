import { Request, Response } from 'express'
import { prisma } from '../config/environment'
import { paginate } from '../helpers/pagination'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { IUser } from '../interfaces/user.interface'
import { ValidationResultError } from '../interfaces/validation.interface'
import { validationResult } from 'express-validator'

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  // Cek hasil validasi
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })

    // Kirim respons error jika ada validasi yang gagal
    return errorResponse(res, 400, 'Validation query param error', validationErrors)
  }

  try {
    // Hitung total jumlah user (untuk menghitung total halaman nanti)
    const totalUsers = await prisma.user.count()

    // Ambil nilai pagination dari helper paginate
    const { skip, limit, paginationMeta } = paginate(req, totalUsers)

    // Ambil data user berdasarkan pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit
    })

    // Pastikan kita menggunakan tipe Prisma User secara langsung
    return successResponse<IUser[]>(res, 200, 'Success get all users', users, paginationMeta)
  } catch (error: any) {
    console.log('🚀 ~ getAll ~ error:', error?.message)
    return errorResponse(res, 500, 'Failed get all users')
  }
}

export const addUser = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })
    return errorResponse(res, 400, 'Validation error', validationErrors)
  }

  try {
    await prisma.user.create({ data: req.body })
    return successResponse(res, 201, 'Success add user', [])
  } catch (error: any) {
    // Handle Prisma error karena title diset @unique di database
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'Email yang anda gunakan sudah ada terdaftar di database, gunakan email yang lain',
        data: null
      })
    }
    return errorResponse(res, 500, 'Failed add user')
  }
}
