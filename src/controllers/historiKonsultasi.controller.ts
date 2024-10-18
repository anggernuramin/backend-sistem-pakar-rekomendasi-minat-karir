import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { IHistoriKonsultasi } from '../interfaces/historiKonsultasi.interface'
import { generateCustomId } from '../services/generateCustomId.service'

export const getAllHistoriKonsultasi = async (req: Request, res: Response): Promise<any> => {
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
    const totalHistoriKonsultasi = await prisma.historiKonsultasi.count()
    const { skip, limit, paginationMeta } = paginate(req, totalHistoriKonsultasi)

    const historiKonsultasis = await prisma.historiKonsultasi.findMany({
      include: {
        user: true,
        minat: true,
        keahlian: true,
        konsultasi: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return successResponse<any>(res, 200, 'Success get all karir', historiKonsultasis, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all karir', error.message)
  }
}

export const getHistoriKonsultasiByUserId = async (req: Request, res: Response): Promise<any> => {
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
    const id = req.params.id
    const user = await checkDataById(id, 'user')

    if (!user) {
      return errorResponse(res, 404, 'User not found')
    }

    const historiKonsultasi = await prisma.historiKonsultasi.findMany({
      where: {
        userId: id
      },
      include: {
        minat: true,
        keahlian: true,
        konsultasi: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Ambil semua data karir
    const allKarir = await prisma.karir.findMany()

    // Kelompokkan berdasarkan konsultasiId
    const groupedHistori = historiKonsultasi.reduce((acc: any, current: any) => {
      const { konsultasiId, minat, keahlian, konsultasi } = current

      // Jika kelompok belum ada, buat kelompok baru
      if (!acc[konsultasiId]) {
        acc[konsultasiId] = {
          konsultasiId,
          hasil: [],
          minat: [],
          keahlian: [],
          createdAt: konsultasi.createdAt
        }
      }

      // Tambahkan hasil dengan nama karir, hindari duplikat
      Object.entries(konsultasi.hasil).forEach(([karirId, persentase]) => {
        // Cari nama karir berdasarkan karirId
        const karir = allKarir.find((k: any) => k.id === karirId)
        if (karir && !acc[konsultasiId].hasil.some((item: any) => item.id === karirId)) {
          acc[konsultasiId].hasil.push({
            id: karirId,
            name: karir.name, // Mengganti kode karir dengan nama karir
            persentase
          })
        }
      })

      // Tambahkan minat jika belum ada
      if (!acc[konsultasiId].minat.some((item: any) => item.id === minat.id)) {
        acc[konsultasiId].minat.push({
          id: minat.id,
          name: minat.name
        })
      }

      // Tambahkan keahlian jika belum ada
      if (!acc[konsultasiId].keahlian.some((item: any) => item.id === keahlian.id)) {
        acc[konsultasiId].keahlian.push({
          id: keahlian.id,
          name: keahlian.name,
          description: keahlian.description
        })
      }

      return acc
    }, {})

    // Ubah objek menjadi array
    const responseData = Object.values(groupedHistori)

    // Lakukan pagination pada hasil yang sudah dikelompokkan
    const totalData = responseData.length
    const { skip, limit, paginationMeta } = paginate(req, totalData)
    const paginatedData = responseData.slice(skip, skip + limit)

    return successResponse<any>(res, 200, 'Success get history', paginatedData, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get history', error.message)
  }
}

export const createHistoriKonsultasi = async (
  minatId: string[],
  keahlianId: string[],
  userId: string,
  konsultasiId: string
) => {
  try {
    for (const minat of minatId) {
      for (const keahlian of keahlianId) {
        const id = await generateCustomId('historiKonsultasi', 'HIS')
        await prisma.historiKonsultasi.create({
          data: {
            id,
            userId,
            minatId: minat,
            keahlianId: keahlian,
            konsultasiId // Menyimpan ID konsultasi
          }
        })
      }
    }
  } catch (error) {
    console.log('🚀 ~ error:', error)
  }
}

export const deleteHistoriKonsultasi = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const historiKonsultasi = await checkDataById(id, 'historikonsultasi')
  if (!historiKonsultasi) {
    return errorResponse(res, 404, 'Histori Konsultasi not found')
  }
  try {
    await prisma.historiKonsultasi.delete({
      where: {
        id
      }
    })
    return successResponse<IHistoriKonsultasi[]>(res, 200, 'Success delete histori konsultasi', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete histori konsultasi', error.message)
  }
}
