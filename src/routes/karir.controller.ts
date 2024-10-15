import { Router } from 'express'
import { validatePagination } from '../validations/pagination.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import { validateMinat } from '../validations/minat.validate'
import { createKarir, deleteKarir, getAllKarir, getKarirById, updateKarir } from '../controllers/karir.controller'
import { validateKarir } from '../validations/karir.validate'

export const KarirRouter: Router = Router()

// Endpoint: /api/keahlian?page=<page>&limit=<limit>
KarirRouter.get('/', validatePagination, requireRoles(['client', 'admin']), getAllKarir)
KarirRouter.get('/:id', requireRoles(['client', 'admin']), getKarirById)

// memasang 2 middleware yaitu requireAdmin dan validateMinat
KarirRouter.post('/', validateKarir, requireRoles(['admin']), createKarir)
KarirRouter.put('/:id', validateMinat, requireRoles(['admin']), updateKarir)
KarirRouter.delete('/:id', requireRoles(['admin']), deleteKarir)
