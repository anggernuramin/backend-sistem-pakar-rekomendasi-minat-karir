import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import { deleteHistoriKonsultasi, getHasilKonsultasi } from '../controllers/historiKonsultasi.controller'
import { validateDate } from '../middlewares/validateDate.middleware'
import { getAllHistoriKonsultasi, getHistoriKonsultasiUser } from '../controllers/historiKonsultasiUser'

export const HistoriKonsultasiRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
HistoriKonsultasiRouter.get(
  '/',
  validatePagination,
  validateDate,
  requireRoles(['admin', 'client']),
  getAllHistoriKonsultasi
)
HistoriKonsultasiRouter.get(
  '/user/:id',
  validatePagination,
  validateDate,
  requireRoles(['client', 'admin']),
  getHistoriKonsultasiUser
)
HistoriKonsultasiRouter.get('/:id', requireRoles(['client', 'admin']), getHasilKonsultasi)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
HistoriKonsultasiRouter.delete('/:id', requireRoles(['admin']), deleteHistoriKonsultasi)
