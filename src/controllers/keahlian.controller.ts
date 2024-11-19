import { Request, Response } from 'express'
import { IKeahlian, INameKeahlianResponse } from '../interfaces/keahlian.interface'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { generateCustomId } from '../services/generateCustomId.service'
import { searching } from '../helpers/searching'

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
    const searchQuery = req.query.search as string

    const searchCondtion = searching(searchQuery, 'minat')
    const totalKeahlian = await prisma.keahlian.count({
      where: searchCondtion
    })
    // Ambil nilai pagination dari helper paginate
    const { skip, limit, paginationMeta } = paginate(req, totalKeahlian)

    // Ambil data user berdasarkan pagination
    const keahlians = await prisma.keahlian.findMany({
      where: searchCondtion,
      skip,
      take: limit
    })

    const responsiveNames: INameKeahlianResponse[] = keahlians.map((keahlian) => {
      return {
        id: keahlian.id,
        idKeahlian: keahlian.id,
        nameKeahlian: keahlian.name,
        descriptionKeahlian: keahlian.description
      }
    })

    return successResponse<INameKeahlianResponse[]>(
      res,
      200,
      'Success get all keahlian',
      responsiveNames,
      paginationMeta
    )
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

    return successResponse<any>(res, 200, 'Success get keahlian', keahlian)
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
  const id = await generateCustomId('keahlian', 'KEA')
  try {
    await prisma.keahlian.create({
      data: {
        id,
        name,
        description
      }
    })

    return successResponse<IKeahlian[]>(res, 201, 'Keahlian berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'Nama Keahlian yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain',
        data: null
      })
    }
    return errorResponse(res, 500, 'Gagal menambah keahlian', error.message)
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
    if (error.code === 'P2002') {
      // Unique constraint violation
      return errorResponse(
        res,
        409,
        'Nama Keahlian yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain.',
        error.message
      )
    }
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
