import { Request, Response } from 'express'
import { IKeahlian } from '../interfaces/keahlian.interface'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'

export const getAllKeahlian = async (req: Request, res: Response): Promise<any> => {
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
    const totalKeahlian = await prisma.keahlian.count()
    // Ambil nilai pagination dari helper paginate
    const { skip, limit, paginationMeta } = paginate(req, totalKeahlian)

    // Ambil data user berdasarkan pagination
    const keahlians = await prisma.keahlian.findMany({
      skip,
      take: limit
    })

    return successResponse<IKeahlian[]>(res, 200, 'Success get all keahlian', keahlians, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all keahlian', error.message)
  }
}

export const getKeahlianById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const keahlian = await checkDataById(id, 'keahlian')

    if (!keahlian) {
      return errorResponse(res, 404, 'Keahlian not found')
    }

    return successResponse<IKeahlian>(res, 200, 'Success get keahlian', keahlian)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get keahlian', error.message)
  }
}

export const createKeahlian = async (req: Request, res: Response): Promise<any> => {
  // Validasi request body
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
    return errorResponse(res, 400, 'Validasi gagal', validationErrors)
  }

  const { name, description } = req.body
  try {
    await prisma.keahlian.create({
      data: {
        name,
        description
      }
    })

    return successResponse<IKeahlian[]>(res, 201, 'Skill berhasil ditambahkan', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal menambah skill', error.message)
  }
}

export const updateKeahlian = async (req: Request, res: Response): Promise<any> => {
  // Validasi request body
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
    return errorResponse(res, 400, 'Validasi gagal', validationErrors)
  }

  try {
    const id = req.params.id
    const keahlian = await checkDataById(id, 'keahlian')
    if (!keahlian) {
      return errorResponse(res, 404, 'Keahlian not found')
    }

    const { name, description } = req.body
    const newKeahlian = await prisma.keahlian.update({
      where: {
        id
      },
      data: {
        name,
        description
      }
    })

    return successResponse<IKeahlian>(res, 200, 'Success update keahlian', newKeahlian)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed update keahlian', error.message)
  }
}

export const deleteKeahlian = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const keahlian = await checkDataById(id, 'keahlian')
  if (!keahlian) {
    return errorResponse(res, 404, 'Keahlian not found')
  }
  try {
    await prisma.keahlian.delete({
      where: {
        id
      }
    })
    return successResponse<IKeahlian[]>(res, 200, 'Success delete keahlian', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete keahlian', error.message)
  }
}
