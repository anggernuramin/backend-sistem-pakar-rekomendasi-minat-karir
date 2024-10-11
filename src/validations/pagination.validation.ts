import { query } from 'express-validator'

export const validatePagination = [
  query('page').optional().isInt({ gt: 0 }).withMessage('Page Harus Integer dan lebih besar dari 0'),
  query('limit').optional().isInt({ gt: 0 }).withMessage('Limit Harus Integer dan lebih besar dari 0')
]
