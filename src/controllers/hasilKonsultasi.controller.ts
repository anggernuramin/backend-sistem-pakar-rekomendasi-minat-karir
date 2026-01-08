import { Request, Response } from 'express'
import { prisma } from '../config/environment'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { uniqBy, uniq } from 'lodash'
import { formatDate, formatTime } from '../helpers/format'

export const getHasilKonsultasiUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params

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
      console.log('hasil Percentage', highPercentage)

      hasilKarir = [highPercentage]
    } else {
      hasilKarir = konsultasi.hasil
    }

    // ambil minat dan keahlian sesuai dengan hasil karir dari table basis aturan
    const hasilKarirId = hasilKarir[0].karirId
    console.log('hasilKarirId', hasilKarirId)
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
