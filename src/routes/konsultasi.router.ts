import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  createKonsultasi,
  deleteKonsultasi,
  getAllKonsultasi,
  getKonsultasiById
} from '../controllers/konsultasi.controller'
import { validateKonsultasi } from '../validations/konsultasi.validate'

export const KonsultasiRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
KonsultasiRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllKonsultasi)
KonsultasiRouter.get('/:id', requireRoles(['client', 'admin']), getKonsultasiById)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
KonsultasiRouter.post('/', validateKonsultasi, requireRoles(['client']), createKonsultasi)
KonsultasiRouter.delete('/:id', requireRoles(['admin']), deleteKonsultasi)
