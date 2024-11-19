import { prisma } from '../config/environment'

export const checkDataById = async (id: string, namaTabel: string) => {
  try {
    let data = null

    switch (namaTabel) {
      case 'user':
        data = await prisma.user.findUnique({
          where: {
            id
          }
        })
        break
      case 'notification':
        data = await prisma.notification.findUnique({
          where: {
            id
          }
        })
        break
      case 'keahlian':
        data = await prisma.keahlian.findUnique({
          where: {
            id
          }
        })
        break
      case 'minat':
        data = await prisma.minat.findUnique({
          where: {
            id
          }
        })
        break
      case 'karir':
        data = await prisma.karir.findUnique({
          where: {
            id
          }
        })
        break
      case 'basisAturan':
        data = await prisma.basisAturan.findUnique({
          where: {
            id
          },
          include: {
            karir: true,
            minat: true,
            keahlian: true
          }
        })
        break

      case 'konsultasi':
        data = await prisma.konsultasi.findUnique({
          where: {
            id
          },
          include: {
            user: true
          }
        })
        break
      case 'historikonsultasi':
        data = await prisma.historiKonsultasi.findUnique({
          where: {
            id
          },
          include: {
            user: true,
            minat: true,
            keahlian: true,
            konsultasi: true
          }
        })
        break
      default:
        return null
    }

    return data ? data : null
  } catch (error) {
    console.log('🚀 ~ checkcategoryById ~ error:', error)
  }
}
