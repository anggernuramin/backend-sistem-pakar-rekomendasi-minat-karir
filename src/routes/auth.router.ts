import { Router } from 'express'
import { checkUser, loginUser, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller'
import { validateLogin, validateRegister } from '../validations/auth.validation'

export const AuthRouter: Router = Router()

AuthRouter.post('/register', validateRegister, registerUser)
AuthRouter.post('/login', validateLogin, loginUser)
AuthRouter.post('/refresh-token', refreshToken)
AuthRouter.get('/logout', logoutUser)
AuthRouter.post('/check-user', checkUser)
