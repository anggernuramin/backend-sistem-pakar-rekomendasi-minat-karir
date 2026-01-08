import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  deleteHistoriKonsultasi,
  getHasilKonsultasi,
  getHistoriKonsultasiUser,
  getAllHistoriKonsultasi
} from '../controllers/historiKonsultasi.controller'
import { validateDate } from '../middlewares/validateDate.middleware'

export const HistoriKonsultasiRouter: Router = Router()

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
HistoriKonsultasiRouter.delete('/:id', requireRoles(['admin']), deleteHistoriKonsultasi)
