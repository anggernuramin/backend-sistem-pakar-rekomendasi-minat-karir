import { validationResult } from 'express-validator'
import { errorResponse, successResponse, successResponseLogin } from '../helpers/apiResponse'
import { ValidationResultError } from '../interfaces/validation.interface'
import { checkPassword, createToken, hashingPassword, checkToken } from '../services/password.service'
import { prisma } from '../config/environment'
import { Request, Response } from 'express'
import { IUser } from '../interfaces/user.interface'

export const registerUser = async (req: Request, res: Response): Promise<any> => {
  // buat id user secara random (optional, karena di db sudah auto generate user ketika mendambah data)
  //   req.body.id = uuidv4()

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        // error is FieldValidationError
        validationErrors[error.path] = error.msg
      }
    })
    // Gunakan errorResponse untuk mengirim response dengan status 400 dan validasi error
    return errorResponse(res, 400, 'Validasi Register gagal', validationErrors)
  }

  try {
    // Pastikan password sudah di-hashing
    if (req.body && req.body.password) {
      req.body.password = hashingPassword(req.body.password)
    }

    // Ubah nilai role menjadi huruf kecil agar sesuai dengan enum di Prisma
    if (req.body.role) {
      req.body.role = req.body.role.toLowerCase()
    }

    // Cek apakah role yang diberikan valid
    if (!['admin', 'client'].includes(req.body.role)) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: 'Role yang diberikan tidak valid. Hanya "admin" atau "client" yang diizinkan.',
        data: null
      })
    }

    await prisma.user.create({ data: req.body })
    successResponse(res, 201, 'Register berhasil dan User berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'Email yang anda gunakan sudah terdaftar di database, gunakan email yang lain',
        data: null
      })
    }
    errorResponse(res, 500, error.message)
  }
}

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })
    return errorResponse(res, 400, 'Validasi login gagal', validationErrors)
  }

  try {
    const user: any = await prisma.user.findUnique({ where: { email: req.body.email } })

    if (!user) {
      return errorResponse(res, 401, 'Login gagal, Password atau Email yang anda masukkan salah', [])
    }

    const isValidPassword = checkPassword(req.body.password, user.password)

    if (!isValidPassword) {
      return errorResponse(res, 401, 'Login gagal, Password atau Email yang anda masukkan salah', [])
    }

    // generate token jika email dan passowrd benar
    const accessToken = createToken(
      { id: user.id, role: user.role },
      {
        // 1 menit
        expiresIn: '1m'
      }
    )

    // refresh token
    const refreshToken = createToken(
      {
        id: user.id,
        role: user.role
      },
      {
        expiresIn: '7d'
      }
    )

    // simpan refresh token di cookie browser
    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // sesuaikan jenis network http atau https
      secure: false, // Hanya untuk HTTPS di production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
    })

    const token = {
      accessToken
    }

    successResponseLogin<IUser[]>(res, 200, 'User berhasil login', user, token)
  } catch (error: any) {
    errorResponse(res, 500, error.message)
  }
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return errorResponse(res, 401, 'Refresh token tidak tersedia', [])
    }
    const verifiedToken = checkToken(refreshToken)

    // Pengecekan apakah token valid, tidak expired, dan decoded tidak null dari function checkToken
    if (!verifiedToken.valid || verifiedToken.expired || !verifiedToken.decoded) {
      return errorResponse(res, 401, 'Refresh token tidak valid atau telah kadaluarsa', [])
    }

    // Pastikan verifiedToken.decoded adalah objek dengan id
    const userId = (verifiedToken.decoded as any).id
    if (!userId) {
      return errorResponse(res, 401, 'User ID tidak ditemukan dalam token', [])
    }

    const user: any = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return errorResponse(res, 401, 'User tidak ditemukan', [])
    }

    // Buat access baru ketika user dengan id yang didapat dari encode token ada
    const newAccesToken = createToken(
      {
        id: user.id,
        role: user.role
      },
      {
        expiresIn: '1d'
      }
    )
    successResponseLogin<IUser[]>(res, 200, 'Token berhasil diperbarui', user, { accessToken: newAccesToken })
  } catch (error: any) {
    return errorResponse(res, 500, error.message)
  }
}
