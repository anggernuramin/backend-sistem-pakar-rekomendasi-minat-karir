import { validationResult } from 'express-validator'
import { ValidationResultError } from '../interfaces/validation.interface'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { Request, Response } from 'express'
import { checkDataById } from '../services/checkDataById.service'
import { prisma } from '../config/environment'
import { generateCustomId } from '../services/generateCustomId.service'
import { createHistoriKonsultasi } from './historiKonsultasi.controller'

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

    // Mencocokkan minat dan keahlian dengan basis aturan dan menghitung CF(H,E)
    for (const rule of allRules) {
      const { karirId, certaintyFactor } = rule

      // Jika tidak ada certaintyFactor, lanjutkan
      if (!certaintyFactor) continue

      // Jika belum ada entry untuk karirId, inisialisasi
      if (!karirMatches[karirId]) {
        karirMatches[karirId] = 0
      }

      // Tambahkan certainty factor ke kecocokan untuk karir ini (CF(H,E))
      const userCF = 1.0 // CF(User) diasumsikan 1.0 berdasarkan aturan
      const CF_H_E = userCF * certaintyFactor
      karirMatches[karirId] += CF_H_E
    }

    // Hitung CF Combine untuk setiap karir
    const careerResults: Record<string, number> = {}

    Object.keys(karirMatches).forEach((karirId) => {
      const CF_H_E = karirMatches[karirId]
      const previousCF = careerResults[karirId] || 0
      const combinedCF = previousCF + CF_H_E * (1 - previousCF)
      careerResults[karirId] = combinedCF
    })

    // Hitung Adjusted CF dengan memperhitungkan kecocokan keahlian
    const karirPercentages: Record<string, number> = {}
    let totalAdjustedCF = 0

    for (const karirId in careerResults) {
      const CF_combine = careerResults[karirId]

      // Hitung kecocokan keahlian
      const requiredSkills = await prisma.keahlian.count({
        where: { basisAturan: { some: { karirId } } }
      })

      const matchedSkills = keahlianId.filter(
        async (id: string) =>
          await prisma.basisAturan.findFirst({
            where: { karirId, keahlianId: id }
          })
      ).length

      const skillMatch = matchedSkills / requiredSkills
      const CF_adjusted = CF_combine * skillMatch

      karirPercentages[karirId] = CF_adjusted * 100
      totalAdjustedCF += CF_adjusted
    }

    // Normalisasi persentase hasil
    const normalizedKarirPercentages: Record<string, number> = {}
    for (const karirId in karirPercentages) {
      normalizedKarirPercentages[karirId] = (karirPercentages[karirId] / totalAdjustedCF) * 100
    }

    // Ambil detail karir dan persentase hasil
    const recommendedKarirs = await Promise.all(
      Object.keys(normalizedKarirPercentages).map(async (karirId) => {
        const karir = await prisma.karir.findUnique({ where: { id: karirId } })
        return {
          karirName: karir?.name,
          karirId: karir?.id,
          percentage: Math.ceil(normalizedKarirPercentages[karirId]).toFixed(2)
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
