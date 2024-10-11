/* eslint-disable @typescript-eslint/no-unused-vars */
// Di sini, T adalah tipe data yang generik, yang artinya kita tidak tahu sebelumnya apa tipe data yang akan dikembalikan (data bisa berupa array, objek, string, dll.). Dengan menggunakan T, kita bisa mendefinisikan bahwa:

// data: T: Argumen data bisa berupa tipe data apa pun (misalnya, array, objek, dll.), dan tipe data ini tetap aman secara tipe.
// SuccessResponse<T>: Menandakan bahwa properti data di dalam response juga akan mengikuti tipe yang sama dengan T.

import { Response } from 'express'
import { IPaginationMeta } from './pagination'
// type success response
export interface ISuccesResponse<T> {
  success: true
  statusCode: number
  message: string
  data: T
  error?: null
  meta?: IPaginationMeta
}

export interface IErrorResponse {
  success: false
  statusCode: number
  message: string
  error?: any
}

// helper success response
export const successResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: IPaginationMeta
): Response<ISuccesResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    meta
  })
}

// helper error response
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): Response<IErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error
  })
}
