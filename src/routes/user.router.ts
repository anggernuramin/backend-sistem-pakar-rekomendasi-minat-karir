import { Router } from 'express'
import { addUser, getAllUsers } from '../controllers/user.controller'
import { validatePagination } from '../validations/pagination.validation'
import { validateRegister } from '../validations/auth.validation'
import { requireAdmin } from '../middlewares/auth.middleware'

export const UserRouter: Router = Router()

// Endpoint: /api/users?page=<page>&limit=<limit>
UserRouter.get('/', validatePagination, getAllUsers)

// memasang 2 middleware yaitu requireAdmin dan validateRegister
UserRouter.post('/', requireAdmin, validateRegister, addUser)
