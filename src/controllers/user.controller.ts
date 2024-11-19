import { Request, Response } from 'express'
import { prisma } from '../config/environment'
import { paginate } from '../helpers/pagination'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { IUser } from '../interfaces/user.interface'
import { ValidationResultError } from '../interfaces/validation.interface'
import { validationResult } from 'express-validator'
import { searching } from '../helpers/searching'
import { checkToken, hashingPassword } from '../services/password.service'
import { checkDataById } from '../services/checkDataById.service'
import path from 'path'
import fs from 'fs'

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })
    return errorResponse(res, 400, 'Validation query param error', validationErrors)
  }

  // Dapatkan ID pengguna yang sedang login dari token autentikasi
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  const verifiedToken = checkToken(token as string)
  if (!verifiedToken.valid || verifiedToken.expired || !verifiedToken.decoded) {
    return errorResponse(res, 401, 'Token tidak valid atau telah kadaluarsa', [])
  }

  const userId = (verifiedToken.decoded as any).id
  if (!userId) {
    return errorResponse(res, 401, 'User ID tidak ditemukan dalam token', [])
  }

  try {
    const searchQuery = req.query.search as string
    const searchCondition = searching(searchQuery, 'user')

    const totalUsers = await prisma.user.count({
      where: {
        ...searchCondition,
        id: { not: userId }
      }
    })

    // Ambil nilai pagination dari helper paginate
    const { skip, limit, paginationMeta } = paginate(req, totalUsers)

    // Ambil data user berdasarkan pagination
    const users = await prisma.user.findMany({
      where: {
        ...searchCondition,
        id: { not: userId }
      },
      skip,
      take: limit
    })

    const formatUser = users.map((user) => {
      return {
        id: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        userPassword: user.password,
        userImage: user.image ? `${req.protocol}://${req.get('host')}${user.image}` : null
      }
    })

    // Pastikan kita menggunakan tipe Prisma User secara langsung
    return successResponse<any[]>(res, 200, 'Success get all users', formatUser, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, `Failed get all users `, error.message)
  }
}

interface IUserId {
  id: string
  name: string
  image: string
  email: string
  role: string
  password: string
}

export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const user = (await checkDataById(id, 'user')) as IUserId // Type assertion

    if (!user) {
      return errorResponse(res, 404, 'User not found')
    }

    const responseData = {
      ...user,
      image: user.image ? `${req.protocol}://${req.get('host')}${user.image}` : null
    }

    return successResponse<any>(res, 200, 'Success get user', responseData)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to get user', error.message)
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

  const imagePath = req.file ? `/uploads/user/${req.file.filename}` : null // Simpan path gambar
  const { name, email, password, role } = req.body
  let createPassword = ''
  if (password) {
    createPassword = hashingPassword(password)
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: createPassword,
        role: role,
        image: imagePath
      }
    })
    return successResponse(res, 201, 'Success add user', [])
  } catch (error: any) {
    // Tangani kesalahan unik pada email
    if (error.code === 'P2002') {
      return errorResponse(
        res,
        409,
        'Email yang anda gunakan sudah ada terdaftar, gunakan email yang lain',
        error.message
      )
    }
    return errorResponse(res, 500, 'Failed to add user', error.message)
  }
}

// update juga image yang telah disimpan sesuai user
export const updateUser = async (req: Request, res: Response): Promise<any> => {
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

  const { id } = req.params
  const { name, email, password, role } = req.body
  let imagePath = null

  // Jika ada file gambar, simpan path gambar baru
  if (req.file) {
    imagePath = `/uploads/user/${req.file.filename}`
  }

  try {
    const user = await checkDataById(id, 'user')
    if (!user) {
      return errorResponse(res, 404, 'User not found', true)
    }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return errorResponse(res, 404, 'User not found', [])
    }

    // Jika password diberikan, hash password baru
    let updatedPassword = existingUser.password
    if (password) {
      updatedPassword = hashingPassword(password)
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        password: updatedPassword,
        role: role || existingUser.role,
        image: imagePath || existingUser.image // Gunakan gambar baru jika ada, jika tidak, tetap gunakan yang lama
      }
    })

    return successResponse(res, 200, 'Success update user', [])
  } catch (error: any) {
    // Tangani kesalahan unik pada email
    if (error.code === 'P2002') {
      return errorResponse(
        res,
        409,
        'Email yang anda gunakan sudah ada terdaftar, gunakan email yang lain',
        error.message
      )
    }
    return errorResponse(res, 500, 'Failed to update user', error.message)
  }
}

// delete juga gambar sesuai dengan user
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const user = await checkDataById(id, 'user')
  if (!user) {
    return errorResponse(res, 404, 'User not found')
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (existingUser?.image) {
      // Hapus file gambar dari file system
      const userImagePath = path.join(__dirname, '../uploads/users/', existingUser?.image) // Path ke file
      if (fs.existsSync(userImagePath)) {
        fs.unlinkSync(userImagePath) // Menghapus file
      }
    }

    await prisma.user.delete({
      where: {
        id
      }
    })

    return successResponse<IUser[]>(res, 200, 'Success delete user', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete user', error.message)
  }
}
