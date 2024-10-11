import { body } from 'express-validator'

export const validateRegister = [
  body('name').notEmpty().withMessage('Name wajib diisi.'),

  body('email').isEmail().withMessage('Email tidak valid.').notEmpty().withMessage('Email wajib diisi.'),

  body('password').notEmpty().withMessage('Password wajib diisi.'),

  body('role').notEmpty().withMessage('Role wajib diisi.')
]

export const validateLogin = [
  body('email').isEmail().withMessage('Email tidak valid.').notEmpty().withMessage('Email wajib diisi.'),

  body('password').notEmpty().withMessage('Password wajib diisi.')
]
