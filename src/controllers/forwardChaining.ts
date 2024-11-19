import { validationResult } from 'express-validator'
import { ValidationResultError } from '../interfaces/validation.interface'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { Request, Response } from 'express'
import { checkDataById } from '../services/checkDataById.service'
import { prisma } from '../config/environment'
import { generateCustomId } from '../services/generateCustomId.service'
import { createHistoriKonsultasi } from './historiKonsultasi.controller'

export const forwardChainingCreateKonsultasi = async (req: Request, res: Response): Promise<any> => {
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

    // Ambil semua basis aturan yang ada
    const allRules = await prisma.basisAturan.findMany({
      select: {
        karirId: true,
        minatId: true,
        keahlianId: true
      }
    })

    // Untuk menyimpan hasil inferensi
    const matchedKarir: string[] = [] // Daftar karir yang cocok

    // Mencocokkan minat dan keahlian dengan basis aturan
    let isMatched = true // Flag untuk menentukan apakah ada aturan yang cocok
    const appliedRules: Set<string> = new Set() // Untuk menyimpan aturan yang sudah diterapkan

    // Mulai inferensi dari fakta yang ada
    while (isMatched) {
      isMatched = false

      // Proses setiap aturan untuk mencari kecocokan dengan fakta
      for (const rule of allRules) {
        const { karirId, minatId: ruleMinat, keahlianId: ruleKeahlian } = rule

        // Cek apakah minat dan keahlian cocok dengan aturan ini dan belum diterapkan
        const minatCocok = minatId.includes(ruleMinat)
        const keahlianCocok = keahlianId.includes(ruleKeahlian)

        if (minatCocok && keahlianCocok && !appliedRules.has(karirId)) {
          // Jika ada kecocokan, tandai aturan ini sudah diterapkan
          appliedRules.add(karirId)
          matchedKarir.push(karirId)
          isMatched = true
        }
      }
    }

    // Ambil informasi tentang karir yang cocok
    const recommendedKarir = await prisma.karir.findMany({
      where: {
        id: {
          in: matchedKarir
        }
      }
    })

    // Simpan hasil konsultasi
    const konsultasiId = await generateCustomId('konsultasi', 'KON')

    // Jika tidak ada kecocokan ditemukan
    // if (matchedKarir.length === 0) {
    //   return successResponse(res, 201, 'Tidak ada kecocokan untuk minat dan keahlian yang dipilih.', {})
    // }

    const konsultasiResult = await prisma.konsultasi.create({
      data: {
        id: konsultasiId,
        userId,
        hasil: matchedKarir.length === 0 ? undefined : recommendedKarir, // Rekomendasi karir yang cocok
        tanggalKonsultasi
      }
    })

    // Simpan ke tabel historiKonsultasi untuk setiap minat dan keahlian yang dipilih pengguna
    await createHistoriKonsultasi(minatId, keahlianId, userId, konsultasiId, tanggalKonsultasi)

    return successResponse(res, 201, 'Konsultasi berhasil', konsultasiResult)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal melakukan konsultasi', error?.message)
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

    return successResponse(
      res,
      200,
      konsultasi.hasil !== null
        ? 'Berhasil mengambil hasil konsultasi'
        : 'Tidak ada kecocokan Karir dengan  minat dan keahlian yang dipilih.',
      konsultasi
    )
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal mengambil hasil konsultasi', error.message)
  }
}
