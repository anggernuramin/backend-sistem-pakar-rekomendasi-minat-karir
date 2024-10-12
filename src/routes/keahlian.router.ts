import { Router } from 'express'
import { validateKeahlian } from '../validations/keahlian.validation'
import {
  createKeahlian,
  deleteKeahlian,
  getAllKeahlian,
  getKeahlianById,
  updateKeahlian
} from '../controllers/keahlian.controller'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'

export const KeahlianRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
KeahlianRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllKeahlian)
KeahlianRouter.get('/:id', requireRoles(['client', 'admin']), getKeahlianById)

// memasang 2 middleware yaitu requireAdmin dan validateKeahlian
KeahlianRouter.post('/', validateKeahlian, requireRoles(['admin']), createKeahlian)
KeahlianRouter.patch('/:id', validateKeahlian, requireRoles(['admin']), updateKeahlian)
KeahlianRouter.delete('/:id', requireRoles(['admin']), deleteKeahlian)
