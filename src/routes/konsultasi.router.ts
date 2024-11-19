import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import {
  // createKonsultasi,
  // createKonsultasi,
  deleteKonsultasi,
  getAllKonsultasi,
  getKonsultasiById,
  getRekapKonsultasiMahasiswaPerBulan
} from '../controllers/konsultasi.controller'
import { validateKonsultasi } from '../validations/konsultasi.validate'
// import { forwardChainingCreateKonsultasi } from '../controllers/forwardChaining'
import {
  getHasilKonsultasiUser,
  getHasilPercentageKonsultasi,
  getJawabanKonsultasi,
  prosesKonsultasiWithForwardChainingAndCertainlyFactor
} from '../controllers/copyHitungPersentase'

export const KonsultasiRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
KonsultasiRouter.get('/rekap', requireRoles(['admin']), getRekapKonsultasiMahasiswaPerBulan)
KonsultasiRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllKonsultasi)
KonsultasiRouter.get('/:id', requireRoles(['client', 'admin']), getKonsultasiById)
KonsultasiRouter.get('/hasil/:id', requireRoles(['client']), getHasilKonsultasiUser)
KonsultasiRouter.get('/hasil/percentage/:id', requireRoles(['client']), getHasilPercentageKonsultasi)
KonsultasiRouter.get('/jawaban/:userId/:id', requireRoles(['client']), getJawabanKonsultasi)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
KonsultasiRouter.post(
  '/',
  validateKonsultasi,
  requireRoles(['client', 'admin']),
  prosesKonsultasiWithForwardChainingAndCertainlyFactor
)
// KonsultasiRouter.post('/', validateKonsultasi, requireRoles(['client']), forwardChainingCreateKonsultasi)

KonsultasiRouter.delete('/:id', requireRoles(['admin']), deleteKonsultasi)
