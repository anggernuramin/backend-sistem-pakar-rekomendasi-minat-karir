export const searching = (searchQuery: string, contains: string, startDate?: string, endDate?: string) => {
  switch (contains) {
    case 'minat':
      return searchQuery ? { OR: [{ name: { contains: searchQuery, mode: 'insensitive' as const } }] } : {}
    case 'keahlian':
      return searchQuery ? { OR: [{ name: { contains: searchQuery, mode: 'insensitive' as const } }] } : {}
    case 'historiKonsultasi':
      if (startDate && endDate) {
        return {
          tanggalHistoriKonsultasi: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      }
      return {}
    case 'karir':
      return searchQuery ? { OR: [{ name: { contains: searchQuery, mode: 'insensitive' as const } }] } : {}
    case 'user':
      return searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' as const } },
              { email: { contains: searchQuery, mode: 'insensitive' as const } }
              // untuk filter role
              // { role: { equals: searchQuery as any } } // Pada Prisma, tipe data role biasanya berupa enum, dan filter contains tidak dapat digunakan pada enum. Sebagai gantinya, Anda harus menggunakan equals
            ]
          }
        : {}
    default:
      return
  }
}

export const searchingDate = (startDate: string | Date, endDate: string | Date) => {
  if (startDate && endDate) {
    return {
      tanggalHistoriKonsultasi: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  }
  return {} // Return an empty filter if no date range is provided
}
