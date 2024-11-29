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

    // Ambil semua basis aturan yang relevan
    const allRules = await prisma.basisAturan.findMany({
      where: {
        minatId: { in: minatId },
        keahlianId: { in: keahlianId }
      },
      select: {
        karirId: true,
        minatId: true,
        keahlianId: true,
        certaintyFactor: true
      }
    })

    // Perhitungan CF(H,E)
    const careerResults: Record<string, { cfCombine: number; matchedSkills: number; requiredSkills: number }> = {}

    for (const rule of allRules) {
      const { karirId, certaintyFactor } = rule

      if (!certaintyFactor) continue // Skip if no certainty factor

      const userCF = 1.0 // Nilai default CF user
      const cfHE = userCF * certaintyFactor // CF(H,E) = CF(User) * CF(Rule)

      if (!careerResults[karirId]) {
        careerResults[karirId] = { cfCombine: 0, matchedSkills: 0, requiredSkills: 0 }
      }

      // Update CF Combine
      const previousCF = careerResults[karirId].cfCombine
      careerResults[karirId].cfCombine = previousCF + cfHE * (1 - previousCF)

      // Update matched skills and required skills
      careerResults[karirId].matchedSkills++
      careerResults[karirId].requiredSkills = await prisma.keahlian.count({
        where: { basisAturan: { some: { karirId } } }
      })
    }

    // Adjust CF Combine with skill match ratio
    let totalCF = 0
    const adjustedResults: Record<string, number> = {}

    for (const [karirId, result] of Object.entries(careerResults)) {
      const { cfCombine, matchedSkills, requiredSkills } = result
      const skillMatch = matchedSkills / requiredSkills
      const cfAdjusted = cfCombine * skillMatch // Penyesuaian dengan rasio kecocokan keahlian
      adjustedResults[karirId] = cfAdjusted
      totalCF += cfAdjusted
    }

    // Normalize the percentages
    const normalizedResults: Record<string, number> = {}
    for (const karirId in adjustedResults) {
      normalizedResults[karirId] = (adjustedResults[karirId] / totalCF) * 100
    }

    // Retrieve career details and construct the response
    const recommendedKarirs = await Promise.all(
      Object.entries(normalizedResults).map(async ([karirId, percentage]) => {
        const karir = await prisma.karir.findUnique({ where: { id: karirId } })
        return {
          karirName: karir?.name,
          karirId: karir?.id,
          percentage: `${Math.ceil(percentage)} %`
        }
      })
    )

    // Simpan hasil konsultasi
    const konsultasiId = await generateCustomId('konsultasi', 'KON')
    const konsultasiResult = await prisma.konsultasi.create({
      data: {
        id: konsultasiId,
        userId,
        hasil: recommendedKarirs.length ? recommendedKarirs : undefined,
        tanggalKonsultasi
      }
    })

    // Simpan ke tabel histori konsultasi
    await createHistoriKonsultasi(minatId, keahlianId, userId, konsultasiId, tanggalKonsultasi)

    return successResponse(res, 201, 'Konsultasi berhasil', konsultasiResult.id)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal melakukan konsultasi', error?.message)
  }
}
