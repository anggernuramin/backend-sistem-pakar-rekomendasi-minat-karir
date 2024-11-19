import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
import { paginate } from '../helpers/pagination'
import { generateCustomId } from '../services/generateCustomId.service'
import { IKonsultasi } from '../interfaces/konsultasi.interface'
import { createHistoriKonsultasi } from './historiKonsultasi.controller'
import { createNotification } from './notification.controller'

export const getAllKonsultasi = async (req: Request, res: Response): Promise<any> => {
  // Cek hasil validasi
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })

    // Kirim respons error jika ada validasi yang gagal
    return errorResponse(res, 400, 'Validation query param error', validationErrors)
  }

  try {
    const totalKonsultasi = await prisma.konsultasi.count()
    // Ambil nilai pagination dari helper paginate
    const { skip, limit, paginationMeta } = paginate(req, totalKonsultasi)

    // Ambil data user berdasarkan pagination
    const konsultasi = await prisma.konsultasi.findMany({
      skip,
      take: limit
    })

    return successResponse<IKonsultasi[]>(res, 200, 'Success get all konsultasi', konsultasi, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all konsultasi', error.message)
  }
}

export const getKonsultasiById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const konsultasi = await checkDataById(id, 'konsultasi')

    if (!konsultasi) {
      return errorResponse(res, 404, 'Konsultasi not found')
    }

    return successResponse<any>(res, 200, 'Success get keahlian', konsultasi)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get keahlian', error.message)
  }
}

export const createKonsultasi = async (req: Request, res: Response): Promise<any> => {
  // Cek validasi
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

  const { userId, minatId, keahlianId } = req.body
  const tanggalKonsultasi = new Date()

  // Validasi apakah user ada di database (opsional, jika perlu)
  const user = await checkDataById(userId, 'user')
  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan')
  }

  try {
    // Ambil semua karir dari tabel basisAturan
    const allKarir = await prisma.basisAturan.findMany({
      select: {
        karirId: true,
        minatId: true,
        keahlianId: true
      }
    })

    // Inisialisasi hasil konsultasi untuk setiap karir
    const karirKecocokan: Record<string, number> = {}

    // Hitung kecocokan untuk setiap aturan yang cocok
    for (const aturan of allKarir) {
      const karirId = aturan.karirId

      // Jika karir belum ada di objek karirKecocokan, inisialisasi dengan nilai 0
      if (!karirKecocokan[karirId]) {
        karirKecocokan[karirId] = 0
      }

      // Hitung kecocokan berdasarkan jumlah minat dan keahlian yang cocok
      const cocokMinat = minatId.includes(aturan.minatId)
      const cocokKeahlian = keahlianId.includes(aturan.keahlianId)
      karirKecocokan[karirId] += Number(cocokMinat) + Number(cocokKeahlian)
    }

    // Pastikan semua karir yang ada dalam basis aturan memiliki nilai
    for (const karir of allKarir) {
      if (!karirKecocokan[karir.karirId]) {
        karirKecocokan[karir.karirId] = 0 // Beri nilai 0 jika tidak ada kecocokan
      }
    }

    // Hitung total kecocokan untuk semua karir
    const totalCocokanSemuaKarir = Object.values(karirKecocokan).reduce((acc, val) => acc + val, 0)

    // Jika total kecocokan lebih dari 0, hitung persentase kecocokan untuk setiap karir
    const karirPersentase =
      totalCocokanSemuaKarir > 0
        ? Object.fromEntries(
            Object.entries(karirKecocokan).map(([karirId, totalCocok]) => [
              karirId,
              Math.round((totalCocok / totalCocokanSemuaKarir) * 100) // Persentase kecocokan
            ])
          )
        : Object.fromEntries(
            Object.keys(karirKecocokan).map((karirId) => [karirId, 0]) // Set semua persentase ke 0 jika tidak ada kecocokan
          )

    // Simpan hasil konsultasi
    const konsultasiId = await generateCustomId('konsultasi', 'KON')
    const konsultasiResult = await prisma.konsultasi.create({
      data: {
        id: konsultasiId,
        userId,
        hasil: karirPersentase,
        tanggalKonsultasi: tanggalKonsultasi
      }
    })

    createNotification('Mahasiswa melakukan Konsultasi', false, userId, tanggalKonsultasi)

    // Simpan ke tabel historiKonsultasi untuk setiap minat dan keahlian dengan referensi ke konsultasiId
    createHistoriKonsultasi(minatId, keahlianId, userId, konsultasiId, tanggalKonsultasi)

    return successResponse(res, 201, 'Konsultasi karir berhasil dilakukan', konsultasiResult)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal melakukan konsultasi karir', error.message)
  }
}

export const deleteKonsultasi = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const konsultasi = await checkDataById(id, 'konsultasi')
  if (!konsultasi) {
    return errorResponse(res, 404, 'konsultasi not found')
  }
  try {
    await prisma.konsultasi.delete({
      where: {
        id
      }
    })
    return successResponse<IKonsultasi[]>(res, 200, 'Success delete konsultasi', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete konsultasi', error.message)
  }
}

// Fungsi untuk mendapatkan rekap konsultasi mahasiswa per bulan (dari Januari hingga Desember)
export const getRekapKonsultasiMahasiswaPerBulan = async (req: Request, res: Response): Promise<any> => {
  try {
    // Nama-nama bulan dalam bahasa Indonesia
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ]

    // Mengelompokkan data konsultasi berdasarkan tanggal konsultasi
    const konsultasi = await prisma.konsultasi.groupBy({
      by: ['tanggalKonsultasi'],
      _count: { id: true }, // Prisma akan menambahkan sebuah kolom hasil bernama _count, yang akan menyimpan hasil perhitungan jumlah baris dalam setiap grup berdasarkan kolom tanggalKonsultasi.
      orderBy: { tanggalKonsultasi: 'asc' }
    })

    // Inisialisasi data bulanan dari Januari hingga Desember dengan nilai 0
    const monthlyData: Record<string, number> = {}
    monthNames.forEach((month) => {
      monthlyData[month] = 0
    })

    // Mengisi data yang ada dalam hasil query
    konsultasi.forEach((item) => {
      const date = new Date(item.tanggalKonsultasi)
      const monthIndex = date.getMonth() // Mendapatkan index bulan (0 = Januari, 11 = Desember)
      const monthName = monthNames[monthIndex]
      monthlyData[monthName] += item._count.id
    })

    // Memformat hasil ke dalam bentuk yang diinginkan untuk frontend
    const formattedData = Object.keys(monthlyData).map((month) => ({
      bulan: month, // Nama bulan
      totalMahasiswa: monthlyData[month] // Jumlah mahasiswa per bulan
    }))

    return successResponse(res, 200, 'Success get monthly konsultasi', formattedData)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to get monthly konsultasi', error.message)
  }
}
