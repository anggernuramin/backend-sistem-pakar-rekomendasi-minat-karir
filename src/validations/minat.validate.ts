import { body } from 'express-validator'

export const validateMinat = [
  body('name')
    .notEmpty()
    .withMessage('Skill wajib diisi.')
    .isString()
    .withMessage('Skill harus berupa string.')
    .isLength({ min: 3 })
    .withMessage('Skill minimal 3 karakter.')
]
