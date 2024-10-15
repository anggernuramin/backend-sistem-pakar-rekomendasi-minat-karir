import { prisma } from '../config/environment'
import { Keahlian, Minat, Karir } from '@prisma/client'

// Type mapping for Prisma models
type PrismaModels = {
  keahlian: Keahlian
  minat: Minat
  karir: Karir
}

export const generateCustomId = async (modelName: keyof PrismaModels, prefix: string): Promise<string> => {
  let nextNumber = 1 // Default nomor berikutnya

  // Ambil entri terakhir dari database untuk menentukan nomor berikutnya
  const lastEntry = await (prisma[modelName] as any).findFirst({
    orderBy: { id: 'desc' }
  })

  // Jika ada entri terakhir, ambil nomor terakhir dan tingkatkan
  if (lastEntry && lastEntry.id) {
    const lastNumber = parseInt(lastEntry.id.slice(prefix.length), 10)
    nextNumber = lastNumber + 1
  }

  // Format ID baru
  return `${prefix}${String(nextNumber).padStart(2, '0')}`
  //   padstart berfungsi untuk memastikan bahwa ID yang dihasilkan memiliki panjang minimal 2 karakter. Jika panjang ID kurang dari 2 karakter, maka akan ditambahkan karakter '0' di depan hingga mencapai panjang 2. misal '1' -> '01' dan 30 -> '30'.
}
