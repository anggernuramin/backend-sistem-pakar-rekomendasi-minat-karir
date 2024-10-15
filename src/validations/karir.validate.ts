import { body } from 'express-validator'

export const validateKarir = [
  body('name')
    .notEmpty()
    .withMessage('Skill wajib diisi.')
    .isString()
    .withMessage('Skill harus berupa string.')
    .isLength({ min: 3 })
    .withMessage('Skill minimal 3 karakter.'),

  body('description').notEmpty().withMessage('Description wajib diisi.'),

  body('pengembangan_karir').optional()
]
