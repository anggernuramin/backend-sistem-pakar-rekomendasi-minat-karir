import { successResponse } from './apiResponse'

export const messageSuccesResponse = (res: any, statusCode: number, message: string, data: any) => {
  switch (statusCode) {
    case 200:
      return successResponse(res, 200, message ? message : 'Success get data', data)
    case 201:
      return successResponse(res, 201, message ? message : 'Success create data', data)
    case 204:
      return successResponse(res, 204, message ? message : 'Success delete data', data)
    default:
      return
  }
}
