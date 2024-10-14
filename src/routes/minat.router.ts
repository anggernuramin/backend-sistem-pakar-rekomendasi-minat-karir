import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import { createMinat, deleteMinat, getAllMinat, getMinatById, updateMinat } from '../controllers/minat.controller'
import { validateMinat } from '../validations/minat.validate'

export const MinatRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
MinatRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllMinat)
MinatRouter.get('/:id', requireRoles(['client', 'admin']), getMinatById)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
MinatRouter.post('/', validateMinat, requireRoles(['admin']), createMinat)
MinatRouter.put('/:id', validateMinat, requireRoles(['admin']), updateMinat)
MinatRouter.delete('/:id', requireRoles(['admin']), deleteMinat)
