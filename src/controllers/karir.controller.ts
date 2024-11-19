import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { IKarir, INameKarirResponse } from '../interfaces/karir.interface'
import { generateCustomId } from '../services/generateCustomId.service'
import { searching } from '../helpers/searching'
import _ from 'lodash'

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
    const searchQuery = req.query.search as string
    const searchCondition = searching(searchQuery, 'karir')

    const totalKarir = await prisma.karir.count()
    const { skip, limit, paginationMeta } = paginate(req, totalKarir)

    const karirs = await prisma.karir.findMany({
      ...(searchCondition ? { where: searchCondition } : {}),
      skip,
      take: limit
    })

    const responsiveNames: INameKarirResponse[] = karirs.map((karir) => {
      return {
        id: karir.id,
        idKarir: karir.id,
        nameKarir: karir.name,
        descriptionKarir: karir.description,
        pengembanganKarir: karir?.pengembangan_karir
      }
    })

    return successResponse<INameKarirResponse[]>(res, 200, 'Success get all karir', responsiveNames, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all karir', error.message)
  }
}

export const getHasilPersentaseKarir = async (req: Request, res: Response): Promise<any> => {
  try {
    const allKarir = await prisma.karir.findMany()

    const hasilKarirKonsultasi = await prisma.konsultasi.findMany({
      select: {
        hasil: true
      }
    })

    if (!hasilKarirKonsultasi || !Array.isArray(hasilKarirKonsultasi) || hasilKarirKonsultasi.length === 0) {
      return successResponse(
        res,
        200,
        'Tidak ada kecocokan hasilKarirKonsultasi dengan  minat dan keahlian yang dipilih',
        []
      )
    }

    const validResult = _(hasilKarirKonsultasi)
      .filter((item: any) => Array.isArray(item.hasil)) // ambil data valid dengan mengecek apakah hasil adalah array, jika null maka abaikan
      .flatMap((item: any) => item.hasil) // gabungkan hasil konsultasi menjadi satu array
      .value() // mengembalikan value akhir

    if (validResult.length === 0) {
      return successResponse(res, 200, 'Tidak ada hasil konsultasi', [])
    }

    // hitung dan kelompokkan berdasarkan jumlah karir dari hasil berdasaran karirId dari validResult
    const groupResult = _.countBy(validResult, 'karirId')

    const totalResult = validResult.length // total data hasil yang valid

    const response = _(allKarir).map((karir) => {
      // cari berapa banyak karirId yang ada didalam hasil konsultasi
      const count = groupResult[karir.id] || 0

      const percentage = totalResult > 0 ? Math.round((count / totalResult) * 100) : 0
      // rumus TotalHasilKonsultasiValid/JumlahKemunculanKarir × 100

      return {
        nama: karir.name,
        percentage
      }
    })

    return successResponse(res, 200, 'Persentase karir berhasil ditemukan', response)
  } catch (error) {
    console.log('🚀 ~ getHasilPersentaseKarir ~ error:', error)
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
      return errorResponse(
        res,
        409,
        'Nama Karir yang anda gunakan sudah ada terdaftar di database, gunakan nama yang lain.',
        error.message
      )
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
