import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  createBasisAturan,
  deleteBasisAturan,
  getAllBasisAturan,
  getBasisAturanById,
  updateBasisAturan
} from '../controllers/basisAturan.controller'
import { validateBasisAturan } from '../validations/basisAturan.validation'

export const BasisAturanRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
BasisAturanRouter.get('/', validatePagination, requireRoles(['admin']), getAllBasisAturan)
BasisAturanRouter.get('/:id', requireRoles(['admin']), getBasisAturanById)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
BasisAturanRouter.post('/', validateBasisAturan, requireRoles(['admin']), createBasisAturan)
BasisAturanRouter.put('/:id', validateBasisAturan, requireRoles(['admin']), updateBasisAturan)
BasisAturanRouter.delete('/:id', requireRoles(['admin']), deleteBasisAturan)
