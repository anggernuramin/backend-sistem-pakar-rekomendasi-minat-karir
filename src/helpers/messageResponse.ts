import { errorResponse } from './apiResponse'

export const messageErrorPrismaResponse = (res: any, statusCode: string) => {
  switch (statusCode) {
    case 'P2002':
      return errorResponse(res, 409, 'The request could not be completed due to a conflict.')
    default:
      return errorResponse(res, 500, 'Unexpected internal server error.')
  }
}
