import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  prosesKonsultasiWithForwardChainingAndCertainlyFactor,
  deleteKonsultasi,
  getAllKonsultasi,
  getKonsultasiById,
  getRekapKonsultasiMahasiswaPerBulan
} from '../controllers/konsultasi.controller'
import { validateKonsultasi } from '../validations/konsultasi.validate'
import {
  getHasilKonsultasiUser,
  getHasilPercentageKonsultasi,
  getJawabanKonsultasi
} from '../controllers/hasilKonsultasi.controller'

export const KonsultasiRouter: Router = Router()

KonsultasiRouter.get('/rekap', requireRoles(['admin']), getRekapKonsultasiMahasiswaPerBulan)
KonsultasiRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllKonsultasi)
KonsultasiRouter.get('/:id', requireRoles(['client', 'admin']), getKonsultasiById)
KonsultasiRouter.get('/hasil/:id', requireRoles(['client']), getHasilKonsultasiUser)
KonsultasiRouter.get('/hasil/percentage/:id', requireRoles(['client']), getHasilPercentageKonsultasi)
KonsultasiRouter.get('/jawaban/:userId/:id', requireRoles(['client']), getJawabanKonsultasi)
KonsultasiRouter.post(
  '/',
  validateKonsultasi,
  requireRoles(['client', 'admin']),
  prosesKonsultasiWithForwardChainingAndCertainlyFactor
)
KonsultasiRouter.delete('/:id', requireRoles(['admin']), deleteKonsultasi)
