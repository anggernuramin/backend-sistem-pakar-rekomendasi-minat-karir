import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
import { prisma } from '../config/environment'
import { checkDataById } from '../services/checkDataById.service'
import { ValidationResultError } from '../interfaces/validation.interface'
// import { generateCustomId } from '../services/generateCustomId.service'
import { IBasisAturan } from '../interfaces/basisAturan.interface'
import { paginate } from '../helpers/pagination'
import { groupBy, uniqBy } from 'lodash'

export const getAllBasisAturan = async (req: Request, res: Response): Promise<any> => {
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
    // Ambil data basis aturan dan gabungkan berdasarkan karirId
    const basisAturans = await prisma.basisAturan.findMany({
      include: {
        karir: true,
        minat: true,
        keahlian: true
      },
      orderBy: {
        karirId: 'asc'
      }
    })

    if (!basisAturans) {
      return errorResponse(res, 404, 'Basis aturan not found')
    }

    // Kelompokkan data berdasarkan karirId
    const groupedData = groupBy(basisAturans, 'karirId')

    // Proses mengelompokkan data minat dan keahlian
    const responseData = Object.entries(groupedData).map(([karirId, basisList]) => {
      const minat = uniqBy(
        basisList.map((basis) => ({
          id: basis.minat.id,
          name: basis.minat.name
        })),
        'id'
      )

      const keahlian = uniqBy(
        basisList.map((basis) => ({
          id: basis.keahlian.id,
          name: basis.keahlian.name,
          description: basis.keahlian.description
        })),
        'id'
      )

      return {
        id: basisList[0].id,
        basisAturansIdKarir: karirId,
        basisAturanKarir: basisList[0].karir.name,
        certaintyFactor: basisList[0].certaintyFactor,
        minat,
        keahlian
      }
    })
    // Lakukan pagination pada hasil yang sudah dikelompokkan
    const totalData = responseData.length
    const { skip, limit, paginationMeta } = paginate(req, totalData)
    const paginatedData = responseData.slice(skip, skip + limit)

    return successResponse<any[]>(res, 200, 'Success get all karir', paginatedData, paginationMeta)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all karir', error.message)
  }
}

export const getBasisAturanById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id
    const basisAturan = await checkDataById(id, 'karir')

    if (!basisAturan) {
      return errorResponse(res, 404, 'basis aturan not found')
    }

    const karir = await prisma.karir.findUnique({ where: { id } })
    if (!karir) {
      return errorResponse(res, 404, 'karir not found')
    }

    const basisAturanByKarir = await prisma.basisAturan.findMany({
      where: {
        karirId: id
      },
      include: {
        karir: true,
        minat: true,
        keahlian: true
      }
    })

    const certaintyFactor = uniqBy(
      basisAturanByKarir.map((basis) => basis.certaintyFactor),
      'certaintyFactor'
    )

    const minat = uniqBy(
      basisAturanByKarir.map((basis) => ({
        id: basis.minat.id,
        name: basis.minat.name
      })),
      'id'
    )

    const keahlian = uniqBy(
      basisAturanByKarir.map((basis) => ({
        id: basis.keahlian.id,
        name: basis.keahlian.name,
        description: basis.keahlian.description
      })),
      'id'
    )

    const response = {
      id: basisAturan.id,
      basisAturansIdKarir: id,
      basisAturanKarir: karir.name,
      certaintyFactor: certaintyFactor[0],
      minat,
      keahlian
    }

    return successResponse<any>(res, 200, 'Success get basis aturan', response)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get karir', error.message)
  }
}

// export const createBasisAturan = async (req: Request, res: Response): Promise<any> => {
//   // Validasi request body
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     const validationErrors: ValidationResultError = {}
//     errors.array().forEach((error) => {
//       if (error.type === 'field') {
//         validationErrors[error.path] = error.msg
//       }
//     })
//     return errorResponse(res, 400, 'Validasi gagal', validationErrors)
//   }

//   const { karirId, minatId, keahlianId } = req.body

//   const karir = await checkDataById(karirId, 'karir')
//   if (!karir) {
//     return errorResponse(res, 404, 'Karir ID tidak ditemukan')
//   }

//   // Validasi minatId
//   const validMinat = await Promise.all(minatId.map((id: string) => checkDataById(id, 'minat')))
//   if (validMinat.includes(null)) {
//     return errorResponse(res, 404, 'Salah satu Minat ID tidak ditemukan')
//   }

//   // Validasi keahlianId
//   const validKeahlian = await Promise.all(keahlianId.map((id: string) => checkDataById(id, 'keahlian')))
//   if (validKeahlian.includes(null)) {
//     return errorResponse(res, 404, 'Salah satu Keahlian ID tidak ditemukan')
//   }
//   // Cek apakah karirId sudah ada di table basis aturan
//   const existingRule = await prisma.basisAturan.findFirst({
//     where: {
//       karirId
//     }
//   })
//   const karirName = await prisma.karir.findUnique({
//     where: {
//       id: existingRule?.karirId
//     }
//   })
//   if (existingRule) {
//     return res.status(409).send({
//       success: false,
//       statusCode: 409,
//       message: `Basis Pengetahuan ${karirName?.name} sudah dibuat`,
//       data: null
//     })
//   }

//   // Cek apakah kombinasi sudah ada di basisAturan
//   try {
//     for (const minat of minatId) {
//       for (const keahlian of keahlianId) {
//         // findFirst() digunakan untuk mencari basis aturan yang memiliki kombinasi karirId, minatId, dan keahlianId setidaknya ada satu
//         // Generate ID basis aturan
//         // case nya setiap action create basis aturan id di basis aturan di genrate beberapa kali agar menghindari duplikat id basis aturan
//         // karena di tabel database menyimpan satu satu basis aturan
//         const id = await generateCustomId('basisAturan', 'BAS')
//         await prisma.basisAturan.create({
//           data: {
//             id,
//             karirId,
//             minatId: minat, // Setiap minatId satu per satu
//             keahlianId: keahlian // Setiap keahlianId satu per satu
//           }
//         })
//       }
//     }
//     return successResponse<IBasisAturan[]>(res, 201, 'Basis aturan berhasil ditambahkan', [])
//   } catch (error: any) {
//     if (error.code === 'P2002') {
//       return errorResponse(res, 409, 'Basis Aturan dengan kombinasi yang anda buat sudah ada.', error.message)
//     }
//     return errorResponse(res, 500, 'Gagal menambah basis aturan', error.message)
//   }
// }

// export const updateBasisAturan = async (req: Request, res: Response): Promise<any> => {
//   // Validate request body
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     const validationErrors: ValidationResultError = {}
//     errors.array().forEach((error) => {
//       if (error.type === 'field') {
//         validationErrors[error.path] = error.msg
//       }
//     })
//     return errorResponse(res, 400, 'Validasi gagal', validationErrors)
//   }

//   const id = req.params.id
//   const { karirId, minatId, keahlianId } = req.body

//   // Check if the BasisAturan record exists
//   const basisAturan = await checkDataById(id, 'basisAturan')
//   if (!basisAturan) {
//     return errorResponse(res, 404, 'Basis Aturan tidak ditemukan')
//   }

//   // Validate the new karirId
//   const karir = await checkDataById(karirId, 'karir')
//   if (!karir) {
//     return errorResponse(res, 404, 'Karir ID tidak ditemukan')
//   }

//   // Validate the new minatId
//   const validMinat = await Promise.all(minatId.map((id: string) => checkDataById(id, 'minat')))
//   if (validMinat.includes(null)) {
//     return errorResponse(res, 404, 'Salah satu Minat ID tidak ditemukan')
//   }

//   // Validate the new keahlianId
//   const validKeahlian = await Promise.all(keahlianId.map((id: string) => checkDataById(id, 'keahlian')))
//   if (validKeahlian.includes(null)) {
//     return errorResponse(res, 404, 'Salah satu Keahlian ID tidak ditemukan')
//   }

//   // Check if a BasisAturan with the same combination already exists (excluding the current one)
//   try {
//     for (const minat of minatId) {
//       for (const keahlian of keahlianId) {
//         const existingRule = await prisma.basisAturan.findFirst({
//           where: {
//             karirId,
//             minatId: minat,
//             keahlianId: keahlian,
//             NOT: { id } // Exclude the current record from the check
//           }
//         })

//         if (existingRule) {
//           return res.status(409).send({
//             success: false,
//             statusCode: 409,
//             message: 'BasisAturan dengan kombinasi karirId, minatId, dan keahlianId sudah ada.',
//             data: null
//           })
//         }
//       }
//     }

//     // Update the BasisAturan records
//     for (const minat of minatId) {
//       for (const keahlian of keahlianId) {
//         await prisma.basisAturan.updateMany({
//           where: {
//             id
//           },
//           data: {
//             karirId,
//             minatId: minat,
//             keahlianId: keahlian
//           }
//         })
//       }
//     }

//     return successResponse<IBasisAturan[]>(res, 200, 'Basis aturan berhasil diperbarui', [])
//   } catch (error: any) {
//     return errorResponse(res, 500, 'Gagal memperbarui basis aturan', error.message)
//   }
// }

export const deleteBasisAturan = async (req: Request, res: Response): Promise<any> => {
  const karirId = req.params.id // Use req.params.id as karirId

  try {
    // mencari semua basis aturan berdasarkan karirId yang ingin di hapus
    // findMany digunakan untuk mencari semua basis aturan yang memiliki karirId yang sesuai
    const basisAturanBerdasarkanKarirId = await prisma.basisAturan.findMany({
      where: {
        karirId: String(karirId)
      }
    })

    // jika basis aturan tidak ditemukan
    if (basisAturanBerdasarkanKarirId.length === 0) {
      return errorResponse(res, 404, 'Basis Aturan not found')
    }

    // Delete semua basis aturan sesuai dengan karirId
    await prisma.basisAturan.deleteMany({
      where: {
        karirId: String(karirId)
      }
    })

    return successResponse<IBasisAturan[]>(res, 200, 'Success delete basis aturan', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete basis aturan', error.message)
  }
}
