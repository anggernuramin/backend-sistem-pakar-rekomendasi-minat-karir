import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  deleteHistoriKonsultasi,
  getAllHistoriKonsultasi,
  getAllHistoriKonsultasiByUserId,
  getHistoriKonsultasiByUserId
} from '../controllers/historiKonsultasi.controller'

export const HistoriKonsultasiRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
HistoriKonsultasiRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllHistoriKonsultasi)
HistoriKonsultasiRouter.get(
  '/all/:id',
  validatePagination,
  requireRoles(['client', 'admin']),
  getAllHistoriKonsultasiByUserId
)
HistoriKonsultasiRouter.get('/:id', requireRoles(['client', 'admin']), getHistoriKonsultasiByUserId)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
HistoriKonsultasiRouter.delete('/:id', requireRoles(['admin']), deleteHistoriKonsultasi)
