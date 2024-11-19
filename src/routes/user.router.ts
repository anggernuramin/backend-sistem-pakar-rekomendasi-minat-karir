import { Router } from 'express'
import { addUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.controller'
import { validatePagination } from '../validations/pagination.validation'
import { validateRegister } from '../validations/auth.validation'
import { requireRoles } from '../middlewares/auth.middleware'
import { middlewareUploudImage } from '../middlewares/image.middleware'

export const UserRouter: Router = Router()

// Endpoint: /api/users?page=<page>&limit=<limit>
UserRouter.get('/', validatePagination, requireRoles(['admin']), getAllUsers)
UserRouter.get('/:id', requireRoles(['admin', 'client']), getUserById)
UserRouter.post(
  '/',
  // KARENA yang dikirim form data maka pastikan untuk urtan form data multer lebih dahulu , setelah itu baru midlleware untuk validasi express validatator (lewat req.body)
  middlewareUploudImage('user', '../uploads/user').single('image'),
  validateRegister,
  requireRoles(['admin']),
  addUser
)

UserRouter.put(
  '/:id',
  middlewareUploudImage('user', '../uploads/user').single('image'),
  validateRegister,
  requireRoles(['admin', 'client']),
  updateUser
)

UserRouter.delete('/:id', requireRoles(['admin']), deleteUser)
