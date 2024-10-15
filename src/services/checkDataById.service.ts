import { prisma } from '../config/environment'

export const checkDataById = async (id: string, namaTabel: string) => {
  try {
    let data = null

    switch (namaTabel) {
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
      default:
        return null
    }

    return data ? data : null
  } catch (error) {
    console.log('🚀 ~ checkcategoryById ~ error:', error)
  }
}
