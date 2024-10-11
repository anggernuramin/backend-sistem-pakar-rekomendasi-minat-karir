import { validationResult } from 'express-validator'
import { errorResponse, successResponse, successResponseLogin } from '../helpers/apiResponse'
import { ValidationResultError } from '../interfaces/validation.interface'
// import { v4 as uuidv4 } from 'uuid'
import { checkPassword, generateToken, hashingPassword } from '../services/password-service'
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
    if (req.body && req.body.password) {
      req.body.password = `${hashingPassword(req?.body?.password)}`
    }
    await prisma.user.create({ data: req.body })
    successResponse(res, 201, 'Register berhasil dan User berhasil ditambahkan', [])
  } catch (error: any) {
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
    const accessToken = generateToken(
      { id: user.id, role: user.role },
      {
        expiresIn: '1d'
      }
    )

    // refresh token
    const refreshToken = generateToken(
      {
        id: user.id,
        role: user.role
      },
      {
        expiresIn: '7d'
      }
    )

    const token = {
      accessToken,
      refreshToken
    }

    successResponseLogin<IUser[]>(res, 201, 'User berhasil login', user, token)
  } catch (error: any) {
    errorResponse(res, 500, error.message)
  }
}
