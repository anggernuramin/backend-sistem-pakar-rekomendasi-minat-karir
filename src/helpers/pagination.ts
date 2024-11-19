import { Request } from 'express'

export interface IPaginationMeta {
  totalItems: number
  totalPages: number | null
  currentPage: number
  limit: number
}

export const paginate = (req: Request, totalItems: number) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20

  const skip = (page - 1) * limit
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0

  const paginationMeta: IPaginationMeta = {
    totalItems,
    totalPages,
    currentPage: page,
    limit
  }

  return { skip, limit, paginationMeta }
}
