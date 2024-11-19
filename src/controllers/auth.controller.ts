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
      return errorResponse(
        res,
        400,
        'Role yang diberikan tidak valid. Hanya "admin" atau "client" yang diizinkan.',
        true
      )
    }

    await prisma.user.create({ data: req.body })
    successResponse(res, 201, 'Register berhasil dan User berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return errorResponse(
        res,
        409,
        'Email yang anda gunakan sudah terdaftar di database, gunakan email yang lain.',
        error.message
      )
    }
    errorResponse(res, 500, 'Register gagal', error.message)
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
      return errorResponse(res, 401, 'Login gagal, Password atau Email yang anda masukkan salah', true)
    }

    const isValidPassword = checkPassword(req.body.password, user.password)

    if (!isValidPassword) {
      return errorResponse(res, 401, 'Login gagal, Password atau Email yang anda masukkan salah', true)
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
    errorResponse(res, 500, 'Login gagal', error.message)
  }
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return errorResponse(res, 401, 'Refresh token tidak tersedia', true)
    }
    const verifiedToken = checkToken(refreshToken)

    // Pengecekan apakah token valid, tidak expired, dan decoded tidak null dari function checkToken
    if (!verifiedToken.valid || verifiedToken.expired || !verifiedToken.decoded) {
      return errorResponse(res, 401, 'Refresh token tidak valid atau telah kadaluarsa', true)
    }

    // Pastikan verifiedToken.decoded adalah objek dengan id
    const userId = (verifiedToken.decoded as any).id
    if (!userId) {
      return errorResponse(res, 401, 'User ID tidak ditemukan dalam token', true)
    }

    const user: any = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return errorResponse(res, 401, 'User tidak ditemukan', true)
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
    return errorResponse(res, 500, 'Refresh token gagal', error.message)
  }
}

export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie('refreshToken')
    successResponse(res, 200, 'Logout berhasil', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Logout gagal', error.message)
  }
}

export const checkUser = async (req: Request, res: Response): Promise<any> => {
  const currentToken = req.body.accessToken

  try {
    if (!currentToken) {
      return errorResponse(res, 401, 'Token tidak ada', true)
    }
    const validToken = checkToken(currentToken)

    // Pengecekan apakah token valid, tidak expired, dan decoded tidak null dari function checkToken
    if (!validToken.valid || validToken.expired || !validToken.decoded) {
      return errorResponse(res, 401, 'Refresh token tidak valid atau telah kadaluarsa', true)
    }

    // Pastikan verifiedToken.decoded adalah objek dengan id
    const userId = (validToken.decoded as any).id
    if (!userId) {
      return errorResponse(res, 401, 'User ID tidak ditemukan dalam token', true)
    }

    const dataUser: any = await prisma.user.findUnique({ where: { id: userId } })

    const responseDataUser = {
      ...dataUser,
      image: dataUser.image ? `${req.protocol}://${req.get('host')}${dataUser.image}` : null
    }

    if (!dataUser) {
      return errorResponse(res, 401, 'User tidak ditemukan', true)
    }

    successResponse<IUser[]>(res, 200, 'User berhasil ditemukan', responseDataUser)
  } catch (error: any) {
    return errorResponse(res, 500, 'Check user gagal', error.message)
  }
}
