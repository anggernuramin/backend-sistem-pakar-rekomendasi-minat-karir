import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { IHistoriKonsultasi } from '../interfaces/historiKonsultasi.interface'
import { formatDate, formatTime } from '../helpers/format'
import { paginate } from '../helpers/pagination'
import { searchingDate } from '../helpers/searching'

export const getAllHistoriKonsultasi = async (req: Request, res: Response): Promise<any> => {
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
    const { tanggalAwal, tanggalAkhir } = req.query

    // Cek jika ada query startDate atau endDate, maka masukkan dalam filter
    const searchDate = searchingDate(tanggalAwal as string, tanggalAkhir as string)

    // Fetch all consultation history with included relationships
    const historiKonsultasi = await prisma.historiKonsultasi.findMany({
      where: {
        ...searchDate
      },
      include: {
        minat: true,
        keahlian: true,
        konsultasi: {
          include: {
            user: true // Include user information for the related consultations
          }
        }
      },
      orderBy: {
        tanggalHistoriKonsultasi: 'desc'
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
          konsultasi: konsultasi
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
    const tempData = Object.values(groupedHistori)

    const responseData = tempData.map((item: any) => {
      const { konsultasiId, hasil, minat, keahlian, konsultasi } = item
      const waktuKonsultasi = {
        tanggal: formatDate(konsultasi.tanggalKonsultasi),
        jam: formatTime(konsultasi.tanggalKonsultasi)
      }
      return {
        nameUserKonsultasi: konsultasi.user.name,
        konsultasiId,
        hasil,
        minatYangDipilih: minat,
        keahlianYangDipilih: keahlian,
        tanggalKonsultasi: waktuKonsultasi.tanggal,
        jamKonsultasi: waktuKonsultasi.jam
      }
    })

    // Lakukan pagination pada hasil yang sudah dikelompokkan
    const totalData = responseData.length
    const { skip, limit, paginationMeta } = paginate(req, totalData)
    const paginatedData = responseData.slice(skip, skip + limit)

    return successResponse<any>(res, 200, 'Success get history', paginatedData, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get history', error.message)
  }
}

export const getHasilKonsultasi = async (req: Request, res: Response): Promise<any> => {
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
        tanggalHistoriKonsultasi: 'desc' // mengurutkan dari tanggal paling baru
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
          konsultasi: konsultasi
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

    interface HistoriKonsultasi {
      konsultasiId: string
      minat: { id: string; name: string }
      keahlian: { id: string; name: string; description: string }
      tanggalKonsultasi: { tanggal: string; jam: string }
      konsultasi: { id: string; userId: string; tanggalKonsultasi: Date; hasil: Record<string, number> }
      hasil: { id: string; name: string; persentase: number }[]
    }

    // Ubah objek menjadi array
    const tempData: HistoriKonsultasi[] = Object.values(groupedHistori)

    // Ambil karir dengan persentase tertinggi
    const highestPersentaseData = tempData[0].hasil.reduce((prev, current) => {
      return prev.persentase > current.persentase ? prev : current
    })

    // Output the result
    const dataKarir = await prisma.basisAturan.findMany({
      where: {
        karirId: highestPersentaseData.id
      },
      include: {
        minat: true,
        keahlian: true
      }
    })

    // Ambil data minat dan keahlian yang sesuai, pastikan tidak ada duplikat
    const uniqueMinat = new Map<string, { id: string; name: string }>()
    const uniqueKeahlian = new Map<string, { id: string; name: string; description: string }>()

    dataKarir.forEach((item) => {
      uniqueMinat.set(item.minat.id, { id: item.minat.id, name: item.minat.name })
      uniqueKeahlian.set(item.keahlian.id, {
        id: item.keahlian.id,
        name: item.keahlian.name,
        description: item.keahlian.description
      })
    })

    const basisAturanMinat = Array.from(uniqueMinat.values())
    const basisAturanKeahlian = Array.from(uniqueKeahlian.values())

    const hasilRekomendasiKarir = {
      karir: highestPersentaseData,
      minat: basisAturanMinat,
      keahlian: basisAturanKeahlian
    }

    const responseWaktuKonsultasi = {
      tanggal: formatDate(tempData[0].konsultasi.tanggalKonsultasi),
      jam: formatTime(tempData[0].konsultasi.tanggalKonsultasi)
    }

    const responseData = {
      konsultasiId: tempData[0].konsultasiId,
      waktuKonsultasi: responseWaktuKonsultasi,
      hasilRekomendasiKarir: hasilRekomendasiKarir,
      minatYangDipilih: tempData[0].minat,
      keahlianYangDipilih: tempData[0].keahlian,
      hasil: tempData[0].hasil
    }

    return successResponse<any>(res, 200, 'Success get history', responseData)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get history', error.message)
  }
}

export const getAllHistoriKonsultasiByUserId = async (req: Request, res: Response): Promise<any> => {
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
    const { id } = req.params
    const { tanggalAwal, tanggalAkhir } = req.query

    const user = await checkDataById(id, 'user')

    if (!user) {
      return errorResponse(res, 404, 'User not found', true)
    }

    // Cek jika ada query startDate atau endDate, maka masukkan dalam filter
    const searchDate = searchingDate(tanggalAwal as string, tanggalAkhir as string)

    const historiKonsultasi = await prisma.historiKonsultasi.findMany({
      where: {
        userId: id,
        ...searchDate
      },
      include: {
        minat: true,
        keahlian: true,
        konsultasi: true
      },
      orderBy: {
        tanggalHistoriKonsultasi: 'desc'
      }
    })

    // cocokkan historikonsultasi dengan konsultasi untuk mengambil hasil konsultasi

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
          konsultasi: konsultasi
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
    const tempData = Object.values(groupedHistori)

    const responseData = tempData.map((item: any) => {
      const { konsultasiId, hasil, minat, keahlian, konsultasi } = item
      const waktuKonsultasi = {
        tanggal: formatDate(konsultasi.tanggalKonsultasi),
        jam: formatTime(konsultasi.tanggalKonsultasi)
      }
      return {
        konsultasiId,
        hasil,
        minatYangDipilih: minat,
        keahlianYangDipilih: keahlian,
        tanggalKonsultasi: waktuKonsultasi.tanggal,
        jamKonsultasi: waktuKonsultasi.jam
      }
    })

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
  konsultasiId: string,
  tanggalKonsultasi: Date
) => {
  try {
    for (const minat of minatId) {
      for (const keahlian of keahlianId) {
        await prisma.historiKonsultasi.create({
          data: {
            userId,
            minatId: minat,
            keahlianId: keahlian,
            konsultasiId,
            tanggalHistoriKonsultasi: tanggalKonsultasi
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
