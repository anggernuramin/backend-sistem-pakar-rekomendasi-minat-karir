import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { IKarir, INameKarirResponse } from '../interfaces/karir.interface'
import { generateCustomId } from '../services/generateCustomId.service'

export const getAllKarir = async (req: Request, res: Response): Promise<any> => {
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
    const totalKarir = await prisma.karir.count()
    const { skip, limit, paginationMeta } = paginate(req, totalKarir)

    const karirs = await prisma.karir.findMany({
      skip,
      take: limit
    })

    const responsiveNames: INameKarirResponse[] = karirs.map((minat) => {
      return {
        id: minat.id,
        nameKarir: minat.name,
        descriptionKarir: minat.description,
        pengembanganKarir: minat?.pengembangan_karir
      }
    })

    return successResponse<INameKarirResponse[]>(res, 200, 'Success get all karir', responsiveNames, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all karir', error.message)
  }
}

export const getKarirById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const karir = await checkDataById(id, 'karir')

    if (!karir) {
      return errorResponse(res, 404, 'karir not found')
    }

    return successResponse<any>(res, 200, 'Success get karir', karir)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get karir', error.message)
  }
}

export const createKarir = async (req: Request, res: Response): Promise<any> => {
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
  const id = await generateCustomId('karir', 'KAR')
  const { name, description, pengembangan_karir } = req.body
  try {
    await prisma.karir.create({
      data: {
        id,
        name,
        description,
        pengembangan_karir
      }
    })

    return successResponse<IKarir[]>(res, 201, 'Karir berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'Nama Karir yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain',
        data: null
      })
    }
    return errorResponse(res, 500, 'Gagal menambah karir', error.message)
  }
}

export const updateKarir = async (req: Request, res: Response): Promise<any> => {
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
    const minat = await checkDataById(id, 'karir')
    if (!minat) {
      return errorResponse(res, 404, 'Karir not found')
    }

    const { name, description, pengembangan_karir } = req.body
    const newKarir = await prisma.karir.update({
      where: {
        id
      },
      data: {
        name,
        description,
        pengembangan_karir
      }
    })

    // pastikan untuk cek dulu karena pengembangan karir tidak optional
    const updateKarir: IKarir = {
      ...newKarir,
      pengembangan_karir: newKarir.pengembangan_karir ? newKarir.pengembangan_karir : ''
    }

    return successResponse<IKarir>(res, 200, 'Success update karir', updateKarir)
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).send({
        success: false,
        statusCode: 409,
        message: 'Nama Karir yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain',
        data: null
      })
    }
    return errorResponse(res, 500, 'Failed update karir', error.message)
  }
}

export const deleteKarir = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const karir = await checkDataById(id, 'karir')
  if (!karir) {
    return errorResponse(res, 404, 'Karir not found')
  }
  try {
    await prisma.karir.delete({
      where: {
        id
      }
    })
    return successResponse<IKarir[]>(res, 200, 'Success delete karir', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete karir', error.message)
  }
}
