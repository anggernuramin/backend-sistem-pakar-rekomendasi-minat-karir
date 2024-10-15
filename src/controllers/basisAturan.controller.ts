import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { generateCustomId } from '../services/generateCustomId.service'
import { IBasisAturan } from '../interfaces/basisAturan.interface'

export const getAllBasisAturan = async (req: Request, res: Response): Promise<any> => {
  // Cek hasil validasi
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

  try {
    const totalBasisAturan = await prisma.basisAturan.count()
    const { skip, limit, paginationMeta } = paginate(req, totalBasisAturan)

    const basisAturans = await prisma.basisAturan.findMany({
      // berikan data table karir, minat dan eahlian juga dalam response
      include: {
        karir: true,
        minat: true,
        keahlian: true
      },
      skip,
      take: limit
    })

    return successResponse<IBasisAturan[]>(res, 200, 'Success get all karir', basisAturans, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all karir', error.message)
  }
}

export const getBasisAturanById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const basisAturan = await checkDataById(id, 'basisAturan')

    if (!basisAturan) {
      return errorResponse(res, 404, 'basis aturan not found')
    }

    return successResponse<any>(res, 200, 'Success get basis aturan', basisAturan)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get karir', error.message)
  }
}

export const createBasisAturan = async (req: Request, res: Response): Promise<any> => {
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
  const id = await generateCustomId('basisAturan', 'BAS')
  const { karirId, minatId, keahlianId } = req.body

  const karir = await checkDataById(karirId, 'karir')
  if (!karir) {
    return errorResponse(res, 404, 'karir id aturan not found')
  }

  // Validasi minatId
  const validMinat = await Promise.all(minatId.map((id: string) => checkDataById(id, 'minat')))
  if (validMinat.includes(null)) {
    return errorResponse(res, 404, 'Salah satu Minat ID tidak ditemukan')
  }

  // Validasi keahlianId
  const validKeahlian = await Promise.all(keahlianId.map((id: string) => checkDataById(id, 'keahlian')))
  if (validKeahlian.includes(null)) {
    return errorResponse(res, 404, 'Salah satu Keahlian ID tidak ditemukan')
  }

  // Jika semua ID valid, lanjutkan untuk menyimpan ke database
  for (let i = 0; i < minatId.length; i++) {
    await prisma.basisAturan.create({
      data: {
        karirId,
        minatId: minatId[i],
        keahlianId: keahlianId[i] // Pastikan array ini dipasangkan dengan benar menangkap ID
      }
    })
  }

  try {
    await prisma.basisAturan.create({
      data: {
        id,
        karirId,
        minatId,
        keahlianId
      }
    })

    return successResponse<IBasisAturan[]>(res, 201, 'Basis aturan berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'BasisAturan dengan kombinasi yang sama sudah ada.',
        data: null
      })
    }
    return errorResponse(res, 500, 'Gagal menambah basis aturan', error.message)
  }
}

export const updateBasisAturan = async (req: Request, res: Response): Promise<any> => {
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
    const basisAturan = await checkDataById(id, 'basisAturan')

    if (!basisAturan) {
      return errorResponse(res, 404, 'Basis aturan not found')
    }

    const { karirId, minatId, keahlianId } = req.body

    const karir = await checkDataById(karirId, 'karir')
    if (!karir) {
      return errorResponse(res, 404, 'karir id aturan not found')
    }

    const minat = await checkDataById(minatId, 'minat')
    if (!minat) {
      return errorResponse(res, 404, 'minat id aturan not found')
    }

    const keahlian = await checkDataById(keahlianId, 'keahlian')
    if (!keahlian) {
      return errorResponse(res, 404, 'keahlian id aturan not found')
    }

    const newBasisAturan = await prisma.basisAturan.update({
      where: {
        id
      },
      data: {
        karirId,
        minatId,
        keahlianId
      },
      include: {
        karir: true,
        minat: true,
        keahlian: true
      }
    })

    return successResponse<IBasisAturan>(res, 200, 'Success update karir', newBasisAturan)
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'BasisAturan dengan kombinasi yang sama sudah ada.',
        data: null
      })
    }
    return errorResponse(res, 500, 'Failed update karir', error.message)
  }
}

export const deleteBasisAturan = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const basisAturan = await checkDataById(id, 'basisAturan')
  if (!basisAturan) {
    return errorResponse(res, 404, 'Basis Aturan not found')
  }
  try {
    await prisma.basisAturan.delete({
      where: {
        id
      }
    })
    return successResponse<IBasisAturan[]>(res, 200, 'Success delete basis aturan', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete basis aturan', error.message)
  }
}
