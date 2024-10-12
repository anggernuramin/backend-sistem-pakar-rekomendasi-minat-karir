import { Router } from 'express'
import { addUser, getAllUsers } from '../controllers/user.controller'
import { validatePagination } from '../validations/pagination.validation'
import { validateRegister } from '../validations/auth.validation'
import { requireRoles } from '../middlewares/auth.middleware'

export const UserRouter: Router = Router()

// Endpoint: /api/users?page=<page>&limit=<limit>
UserRouter.get('/', validatePagination, requireRoles(['admin']), getAllUsers)

// memasang 2 middleware yaitu requireAdmin dan validateRegister
UserRouter.post('/', validateRegister, requireRoles(['admin']), addUser)
