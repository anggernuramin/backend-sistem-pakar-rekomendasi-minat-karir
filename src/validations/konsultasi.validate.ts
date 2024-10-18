import { body } from 'express-validator'

export const validateKonsultasi = [
  // Validasi karirId
  body('userId').notEmpty().withMessage('User Id wajib diisi.').isString().withMessage('User Id harus berupa string.'),

  // Validasi minatId
  body('minatId')
    .isArray()
    .withMessage('Minat Id harus berupa array.')
    .notEmpty()
    .withMessage('Minat Id wajib diisi.')
    .custom((value) => {
      // Validasi setiap elemen dalam array minatId harus berupa string
      for (const id of value) {
        if (typeof id !== 'string') {
          throw new Error('Setiap Minat Id harus berupa string.')
        }
      }
      return true
    }),

  // Validasi keahlianId
  body('keahlianId')
    .isArray()
    .withMessage('Keahlian Id harus berupa array.')
    .notEmpty()
    .withMessage('Keahlian Id wajib diisi.')
    .custom((value) => {
      // Validasi setiap elemen dalam array keahlianId harus berupa string
      for (const id of value) {
        if (typeof id !== 'string') {
          throw new Error('Setiap Keahlian Id harus berupa string.')
        }
      }
      return true
    })
]
