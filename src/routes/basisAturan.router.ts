import { Router } from 'express'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  // createBasisAturan,
  deleteBasisAturan,
  getAllBasisAturan,
  getBasisAturanById
  // updateBasisAturan
} from '../controllers/basisAturan.controller'
import { validateBasisAturan } from '../validations/basisAturan.validation'
import { validatePagination } from '../validations/pagination.validation'
import { createBasisAturanWithCertaintyFactor } from '../controllers/copyHitungPersentase'

export const BasisAturanRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
BasisAturanRouter.get('/', validatePagination, requireRoles(['admin']), getAllBasisAturan)
BasisAturanRouter.get('/:id', requireRoles(['admin']), getBasisAturanById)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
BasisAturanRouter.post('/', validateBasisAturan, requireRoles(['admin']), createBasisAturanWithCertaintyFactor)
// BasisAturanRouter.put('/:id', validateBasisAturan, requireRoles(['admin']), updateBasisAturan)
BasisAturanRouter.delete('/:id', requireRoles(['admin']), deleteBasisAturan)
