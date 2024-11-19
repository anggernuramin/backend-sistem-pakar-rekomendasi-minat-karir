import { prisma } from '../config/environment'
import { Keahlian, Minat, Karir, BasisAturan, Konsultasi, HistoriKonsultasi } from '@prisma/client'

// Type mapping for Prisma models
type PrismaModels = {
  keahlian: Keahlian
  minat: Minat
  karir: Karir
  basisAturan: BasisAturan
  konsultasi: Konsultasi
  historiKonsultasi: HistoriKonsultasi
}
export const generateCustomId = async (modelName: keyof PrismaModels, prefix: string): Promise<string> => {
  let nextNumber = 1 // Default nomor berikutnya

  // Ambil entri terakhir dari database untuk menentukan nomor berikutnya
  const lastEntry = await (prisma[modelName] as any).findFirst({
    where: { id: { startsWith: prefix } }, // Filter untuk ID yang dimulai dengan prefix
    orderBy: { id: 'desc' }
  })

  // Jika ada entri terakhir, ambil nomor terakhir dan tingkatkan
  if (lastEntry && lastEntry.id) {
    const numericPart = lastEntry.id.slice(prefix.length) // pisahkan bagian numerik dari ID
    const lastNumber = parseInt(numericPart, 10) // Mengubah ke nomor

    // Jika parsing berhasil, tingkatkan lastNumber untuk mendapatkan nextNumber
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    } else {
      console.error(`Error parsing last ID ${lastEntry.id} for model ${modelName}`)
    }
  }

  // Atur padding untuk hasilkan ID baru
  const paddedNumber = nextNumber < 10 ? `0${nextNumber}` : `${nextNumber}`

  // Menghasilkan ID baru
  return `${prefix}${paddedNumber}`
}
