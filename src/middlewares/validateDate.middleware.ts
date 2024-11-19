import { query } from 'express-validator'

// Validasi untuk parameter query startDate dan endDate
export const validateDate = [
  query('tanggalAwal')
    .optional()
    .isISO8601()
    .withMessage('Tanggal Awal harus dalam format YYYY-MM-DD atau tanggal yang valid'),
  query('tanggalAkhir')
    .optional()
    .isISO8601()
    .withMessage('Tanggal Akhir harus dalam format YYYY-MM-DD atau tanggal yang valid')
]
// import { query } from 'express-validator'

// // Fungsi validasi kustom untuk MM-DD-YYYY
// const isValidDate = (date: string) => {
//   const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/ // MM-DD-YYYY format
//   return regex.test(date)
// }

// export const validateDate = [
//   query('startDate')
//     .optional()
//     .custom((value) => {
//       if (value && !isValidDate(value)) {
//         throw new Error('Start Date harus dalam format MM-DD-YYYY')
//       }
//       return true
//     }),
//   query('endDate')
//     .optional()
//     .custom((value) => {
//       if (value && !isValidDate(value)) {
//         throw new Error('End Date harus dalam format MM-DD-YYYY')
//       }
//       return true
//     })
// ]
