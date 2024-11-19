import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { ValidationResultError } from '../interfaces/validation.interface'
import { checkDataById } from '../services/checkDataById.service'
import { searchingDate } from '../helpers/searching'
import { prisma } from '../config/environment'
import { paginate } from '../helpers/pagination'
import { formatDate } from '../helpers/format'
import { formatTime } from '../helpers/format'
import { groupBy, uniqBy } from 'lodash'
import { JsonArray } from '@prisma/client/runtime/library'

export const getHistoriKonsultasiUser = async (req: Request, res: Response): Promise<any> => {
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
    // Fetch histori konsultasi
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

    if (!historiKonsultasi.length) {
      return successResponse(res, 200, 'No history found', [])
    }

    const rekapData = Object.values(groupBy(historiKonsultasi, (histori) => histori.konsultasiId)).map(
      (groupedHistori) => {
        const histori = groupedHistori[0] // Take one record per group (since they're grouped by konsultasiId)

        const konsultasiHasil = histori.konsultasi.hasil as JsonArray // Ensure it's an array
        const hasilKarir = Array.isArray(konsultasiHasil)
          ? konsultasiHasil.map((item: any) => ({
              karirName: item.karirName,
              percentage: item.percentage
            }))
          : []

        return {
          minatHistoriKonsultasi: uniqBy(
            groupedHistori.flatMap((item) => item.minat),
            'id'
          ),
          keahlianHistoriKonsultasi: uniqBy(
            groupedHistori.flatMap((item) => item.keahlian),
            'id'
          ),
          hasilHistoriKonsultasi: hasilKarir,
          tanggalHistoriKonsultasi: formatDate(histori.tanggalHistoriKonsultasi),
          jamHistoriKonsultasi: formatTime(histori.tanggalHistoriKonsultasi)
        }
      }
    )

    const totalData = rekapData.length
    const { skip, limit, paginationMeta } = paginate(req, totalData)

    if (rekapData.length === 0) {
      return successResponse(res, 200, 'No history found', [], paginationMeta)
    }

    const paginatedData = rekapData.slice(skip, skip + limit)

    return successResponse(res, 200, 'Success get history', paginatedData, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get history', error.message)
  }
}

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
    // Fetch histori konsultasi
    const historiKonsultasi = await prisma.historiKonsultasi.findMany({
      where: {
        ...searchDate
      },
      include: {
        user: true,
        minat: true,
        keahlian: true,
        konsultasi: true
      },
      orderBy: {
        tanggalHistoriKonsultasi: 'desc'
      }
    })

    if (!historiKonsultasi.length) {
      return successResponse(res, 200, 'No history found', [])
    }

    const rekapData = Object.values(groupBy(historiKonsultasi, (histori) => histori.konsultasiId)).map(
      (groupedHistori) => {
        const histori = groupedHistori[0] // Take one record per group (since they're grouped by konsultasiId)

        const konsultasiHasil = histori.konsultasi.hasil as JsonArray // Ensure it's an array
        const hasilKarir = Array.isArray(konsultasiHasil)
          ? konsultasiHasil.map((item: any) => ({
              karirName: item.karirName,
              percentage: item.percentage
            }))
          : []

        return {
          userHistoriKonsultasi: uniqBy(
            groupedHistori.flatMap((item) => item.user),
            'id'
          ), //Fungsi flatMap pertama-tama akan memetakan setiap elemen di groupedHistori ke dalam array item.user milik objek tersebut.
          //Setelah itu, flatMap akan meratakan (flatten) array-array yang dihasilkan menjadi satu array datar.
          minatHistoriKonsultasi: uniqBy(
            groupedHistori.flatMap((item) => item.minat),
            'id'
          ),
          keahlianHistoriKonsultasi: uniqBy(
            groupedHistori.flatMap((item) => item.keahlian),
            'id'
          ),
          hasilHistoriKonsultasi: hasilKarir,
          tanggalHistoriKonsultasi: formatDate(histori.tanggalHistoriKonsultasi),
          jamHistoriKonsultasi: formatTime(histori.tanggalHistoriKonsultasi)
        }
      }
    )

    const totalData = rekapData.length
    console.log('🚀 ~ getHistoriKonsultasiUser ~ totalData:', totalData)
    const { skip, limit, paginationMeta } = paginate(req, totalData)

    if (rekapData.length === 0) {
      console.log('🚀 ~ getHistoriKonsultasiUser ~ paginationMeta:', paginationMeta)
      return successResponse(res, 200, 'No history found', [], paginationMeta)
    }

    const paginatedData = rekapData.slice(skip, skip + limit)

    return successResponse(res, 200, 'Success get history', paginatedData, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get history', error.message)
  }
}
