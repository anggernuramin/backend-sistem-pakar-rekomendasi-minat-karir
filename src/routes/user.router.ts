import { Router } from 'express'
import { getAllUsers } from '../controllers/user.controller'
import { validatePagination } from '../validations/pagination.validation'

export const UserRouter: Router = Router()

// Endpoint: /api/users?page=<page>&limit=<limit>
UserRouter.get('/', validatePagination, getAllUsers)
