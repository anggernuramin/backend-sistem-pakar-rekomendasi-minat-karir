import { validationResult } from 'express-validator'
import { ValidationResultError } from '../interfaces/validation.interface'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { Request, Response } from 'express'
import { checkDataById } from '../services/checkDataById.service'
import { prisma } from '../config/environment'
import { generateCustomId } from '../services/generateCustomId.service'
import { createHistoriKonsultasi } from './historiKonsultasi.controller'
import { IBasisAturan } from '../interfaces/basisAturan.interface'
import { formatDate, formatTime } from '../helpers/format'
import { uniq, uniqBy } from 'lodash'

export const prosesKonsultasiWithForwardChainingAndCertainlyFactor = async (
  req: Request,
  res: Response
): Promise<any> => {
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

  try {
    const { userId, minatId, keahlianId, tanggalKonsultasi } = req.body

    // Validasi apakah user ada di database
    const user = await checkDataById(userId, 'user')
    if (!user) {
      return errorResponse(res, 404, 'User tidak ditemukan')
    }

    // Ambil semua basis aturan yang ada dan certainty factor terkait
    const allRules = await prisma.basisAturan.findMany({
      where: {
        minatId: {
          in: minatId // hanya ambil yang cocok dengan minatId yang dikirim oleh user
        },
        keahlianId: {
          in: keahlianId // hanya ambil yang cocok dengan keahlianId yang dikirim oleh user
        }
      },
      select: {
        karirId: true,
        minatId: true,
        keahlianId: true,
        certaintyFactor: true // Mengambil certainty factor dari setiap aturan
      }
    })

    // Untuk menyimpan kecocokan per karir
    const karirMatches: Record<string, number> = {}

    // Mencocokkan minat dan keahlian dengan basis aturan dan menghitung certainty factor
    for (const rule of allRules) {
      const { karirId, certaintyFactor } = rule

      // Jika tidak ada certaintyFactor, lanjutkan
      if (!certaintyFactor) continue

      // Jika belum ada entry untuk karirId, inisialisasi
      if (!karirMatches[karirId]) {
        karirMatches[karirId] = 0
      }

      // Tambahkan certainty factor ke kecocokan untuk karir ini
      karirMatches[karirId] += certaintyFactor // Menambahkan certainty factor
    }

    // Hitung persentase untuk setiap karir
    const totalMatches = Object.values(karirMatches).reduce((sum, score) => sum + score, 0)

    // Jika total kecocokan lebih dari 0, hitung persentase untuk masing-masing karir
    const karirPercentages: Record<string, number> = {}
    if (totalMatches > 0) {
      Object.keys(karirMatches).forEach((karirId) => {
        const matchScore = karirMatches[karirId]
        const percentage = (matchScore / totalMatches) * 100 // Menghitung persentase dari total kecocokan
        karirPercentages[karirId] = percentage
      })
    }

    // Ambil detail karir dan persentase hasil
    const recommendedKarirs = await Promise.all(
      Object.keys(karirPercentages).map(async (karirId) => {
        const karir = await prisma.karir.findUnique({
          where: { id: karirId }
        })
        return {
          karirName: karir?.name,
          karirId: karir?.id,
          percentage: Math.ceil(karirPercentages[karirId])
        }
      })
    )

    // Simpan hasil konsultasi
    const konsultasiId = await generateCustomId('konsultasi', 'KON')
    const konsultasiResult = await prisma.konsultasi.create({
      data: {
        id: konsultasiId,
        userId,
        hasil: recommendedKarirs.length ? recommendedKarirs : undefined, // Rekomendasi karir berdasarkan kecocokan
        tanggalKonsultasi
      }
    })

    // Simpan ke tabel historiKonsultasi untuk setiap minat dan keahlian yang dipilih pengguna
    await createHistoriKonsultasi(minatId, keahlianId, userId, konsultasiId, tanggalKonsultasi)

    return successResponse(res, 201, 'Konsultasi berhasil', konsultasiResult.id)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal melakukan konsultasi', error?.message)
  }
}

export const createBasisAturanWithCertaintyFactor = async (req: Request, res: Response): Promise<any> => {
  // Validasi request body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })
    return errorResponse(res, 400, 'Validasi gagal', validationErrors)
  }

  const { karirId, minatId, keahlianId, certaintyFactor } = req.body

  const karir = await checkDataById(karirId, 'karir')
  if (!karir) {
    return errorResponse(res, 404, 'Karir ID tidak ditemukan')
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

  // Cek apakah karirId sudah ada di table basis aturan
  const existingRule = await prisma.basisAturan.findFirst({
    where: {
      karirId
    }
  })
  if (existingRule) {
    const karirName = await prisma.karir.findUnique({
      where: {
        id: existingRule?.karirId
      }
    })
    return res.status(409).send({
      success: false,
      statusCode: 409,
      message: `Basis Pengetahuan Karir ${karirName?.name} sudah dibuat`,
      data: null
    })
  }

  // Cek apakah kombinasi sudah ada di basisAturan
  try {
    for (const minat of minatId) {
      for (const keahlian of keahlianId) {
        // Generate ID basis aturan
        const id = await generateCustomId('basisAturan', 'BAS')

        // Create basis aturan dengan certaintyFactor
        await prisma.basisAturan.create({
          data: {
            id,
            karirId,
            minatId: minat, // Setiap minatId satu per satu
            keahlianId: keahlian, // Setiap keahlianId satu per satu
            certaintyFactor // Menyimpan nilai certaintyFactor untuk aturan ini
          }
        })
      }
    }
    return successResponse<IBasisAturan[]>(res, 201, 'Basis aturan berhasil ditambahkan', [])
  } catch (error: any) {
    if (error.code === 'P2002') {
      return errorResponse(res, 409, 'Basis Aturan dengan kombinasi yang anda buat sudah ada.', error.message)
    }
    return errorResponse(res, 500, 'Gagal menambah basis aturan', error.message)
  }
}

export const getHasilKonsultasiUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params // Ambil konsultasiId dari params URL

  try {
    // Cari data konsultasi berdasarkan konsultasiId
    const konsultasi = await prisma.konsultasi.findUnique({
      where: {
        id
      }
    })

    if (!konsultasi) {
      return errorResponse(res, 404, 'Konsultasi tidak ditemukan')
    }

    if (!konsultasi.hasil || !Array.isArray(konsultasi.hasil) || konsultasi.hasil.length === 0) {
      return successResponse(res, 200, 'Tidak ada kecocokan Karir dengan  minat dan keahlian yang dipilih', [])
    }

    let hasilKarir: any

    // ambil nilai hasil konsultasi dengan persentase paling tinggi jika hasil lebih dari 1 object
    if (konsultasi?.hasil?.length > 1) {
      const highPercentage = konsultasi.hasil.reduce((max: any, current: any) => {
        return current.percentage > max.percentage ? current : max
      }, konsultasi.hasil[0])
      hasilKarir = [highPercentage]
    } else {
      hasilKarir = konsultasi.hasil
    }

    // ambil minat dan keahlian sesuai dengan hasil karir dari table basis aturan
    const hasilKarirId = hasilKarir[0].karirId
    const dataKarirBasisAturan = await prisma.basisAturan.findMany({
      where: {
        karirId: hasilKarirId
      },
      include: {
        minat: { select: { id: true, name: true } },
        keahlian: { select: { id: true, name: true, description: true } }
      }
    })

    const karir = await prisma.karir.findFirst({
      where: {
        id: hasilKarirId
      }
    })

    // format hasil basis aturan agar menjadi 1 data yang utuh sesuai minat dan keahlian
    const minat = uniqBy(
      dataKarirBasisAturan.map((item) => item.minat),
      'id'
    )
    const keahlian = uniqBy(
      dataKarirBasisAturan.map((item) => item.keahlian),
      'id'
    )

    const response = {
      hasilKarir: karir?.name,
      hasilDescriptionKarir: karir?.description,
      hasilPengembanganKarir: karir?.pengembangan_karir,
      hasilMinat: minat,
      hasilKeahlian: keahlian
    }

    return successResponse(res, 200, 'Success get hasil konsultasi', response)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal mengambil hasil konsultasi', error.message)
  }
}

export const getHasilPercentageKonsultasi = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params // Ambil konsultasiId dari params URL

  try {
    // Cari data konsultasi berdasarkan konsultasiId
    const konsultasi = await prisma.konsultasi.findUnique({
      where: {
        id
      }
    })

    if (!konsultasi) {
      return errorResponse(res, 404, 'Konsultasi tidak ditemukan')
    }

    const karir = await prisma.karir.findMany()

    if (
      !konsultasi.hasil ||
      konsultasi.hasil === null ||
      !Array.isArray(konsultasi.hasil) ||
      konsultasi.hasil.length === 0
    ) {
      const response = karir.map((item) => {
        return {
          karir: item.name,
          karirId: item.id,
          percentage: 0
        }
      })
      return successResponse(res, 200, 'Tidak ada kecocokan Karir dengan  minat dan keahlian yang dipilih', response)
    }

    const response = karir.map((item) => {
      const hasil = (konsultasi.hasil as { karirId: string; karirName: string; percentage: number }[]).find((hasil) => {
        return hasil.karirName === item.name
      })
      return {
        karir: item.name,
        karirId: item.id,
        percentage: hasil ? hasil.percentage : 0
      }
    })

    return successResponse(res, 200, 'Success get hasil percentage karir', response)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal mengambil hasil percentage karir', error.message)
  }
}

export const getJawabanKonsultasi = async (req: Request, res: Response): Promise<any> => {
  const { userId, id } = req.params
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    if (!user) {
      return errorResponse(res, 404, 'User tidak ditemukan')
    }

    const konsultasi = await prisma.konsultasi.findUnique({
      where: {
        id
      }
    })
    if (!konsultasi) {
      return errorResponse(res, 404, 'Konsultasi tidak ditemukan')
    }

    const historiJawaban = await prisma.historiKonsultasi.findMany({
      where: {
        konsultasiId: id
      },
      include: {
        minat: true,
        keahlian: true
      }
    })

    const responseHistoriKonsultasi = {
      tanggal: formatDate(historiJawaban[0].tanggalHistoriKonsultasi),
      jam: formatTime(historiJawaban[0].tanggalHistoriKonsultasi)
    }

    const minat = uniq(historiJawaban.map((item) => item.minat.name))
    const keahlian = uniq(historiJawaban.map((item) => item.keahlian.name))

    const dataResponse = {
      jawabanMinat: minat,
      jawabanKeahlian: keahlian,
      tanggalKonsultasi: responseHistoriKonsultasi.tanggal,
      jamKonsultasi: responseHistoriKonsultasi.jam
    }

    return successResponse(res, 200, 'Success get jawaban konsultasi', dataResponse)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal mengambil jawaban konsultasi', error.message)
  }
}
