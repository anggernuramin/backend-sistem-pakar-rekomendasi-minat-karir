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
      default:
        return null
    }

    return data ? data : null
  } catch (error) {
    console.log('🚀 ~ checkcategoryById ~ error:', error)
  }
}
