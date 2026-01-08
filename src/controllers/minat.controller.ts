import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { IMinat, INameMinatResponse } from '../interfaces/minat.interface'
import { generateCustomId } from '../services/generateCustomId.service'
import { searching } from '../helpers/searching'

export const getAllMinat = async (req: Request, res: Response): Promise<any> => {
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
    // Frontend: Gunakan encodeURIComponent() untuk mengencode query string sebelum mengirim permintaan
    // encodeURIComponent(). Ini akan mengubah spasi menjadi %20 dan karakter khusus lainnya menjadi format yang aman
    const searchQuery = req.query.search as string

    const searchCondtion = searching(searchQuery, 'minat')

    const totalMinat = await prisma.minat.count({
      where: searchCondtion
    })
    // Ambil nilai pagination dari helper paginate
    const { skip, limit, paginationMeta } = paginate(req, totalMinat)

    // Ambil data user berdasarkan pagination
    const minats = await prisma.minat.findMany({
      where: searchCondtion,
      skip,
      take: limit
    })

    const responsiveNames: INameMinatResponse[] = minats.map((minat) => {
      return {
        idMinat: minat.id,
        id: minat.id,
        nameMinat: minat.name
      }
    })

    return successResponse<INameMinatResponse[]>(res, 200, 'Success get all minat', responsiveNames, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all minat', error.message)
  }
}

export const getMinatById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const minat = await checkDataById(id, 'minat')

    if (!minat) {
      return errorResponse(res, 404, 'Minat not found')
    }

    return successResponse<any>(res, 200, 'Success get minat', minat)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get minat', error.message)
  }
}

export const createMinat = async (req: Request, res: Response): Promise<any> => {
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

  const id = await generateCustomId('minat', 'MIN')
  const { name } = req.body
  try {
    await prisma.minat.create({
      data: {
        id,
        name
      }
    })

    return successResponse<IMinat[]>(res, 201, 'Minat berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'Nama Minat yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain',
        data: null
      })
    }
    return errorResponse(res, 500, 'Gagal menambah minat', error.message)
  }
}

export const updateMinat = async (req: Request, res: Response): Promise<any> => {
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
    const minat = await checkDataById(id, 'minat')
    if (!minat) {
      return errorResponse(res, 404, 'Minat not found')
    }

    const { name } = req.body
    const newMinat = await prisma.minat.update({
      where: {
        id
      },
      data: {
        name
      }
    })

    return successResponse<IMinat>(res, 200, 'Success update minat', newMinat)
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return errorResponse(
        res,
        409,
        'Nama Minat yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain',
        error.message
      )
    }
    return errorResponse(res, 500, 'Failed update minat', error.message)
  }
}

export const deleteMinat = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const minat = await checkDataById(id, 'minat')

  if (!minat) {
    return errorResponse(res, 404, 'Minat not found')
  }
  try {
    await prisma.minat.delete({
      where: {
        id
      }
    })
    return successResponse<IMinat[]>(res, 200, 'Success delete minat', [])
  } catch (error: any) {
    // eroro ketika data master masih digunakan di tabel lain
    if (error.code === 'P2003') {
      return errorResponse(res, 409, 'Minat masih digunakan di tabel lain', error.message)
    }
    return errorResponse(res, 500, 'Failed delete minat', error.message)
  }
}
