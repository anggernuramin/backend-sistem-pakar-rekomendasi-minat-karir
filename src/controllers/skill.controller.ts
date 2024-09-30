import { Request, Response } from 'express'

type Skill = {
  id: number
  name: string
}

type ErrorType = {
  success: boolean
  statusCode: number
  message: string
  data: any | null
}

type CustomError = {
  message: string
  statusCode?: number
  stack?: string
}

export const getSkills = async (req: Request, res: Response): Promise<any> => {
  const skills: Skill[] = [
    {
      id: 1,
      name: 'Frontend'
    },
    {
      id: 2,
      name: 'Backend'
    },
    {
      id: 3,
      name: 'Mobile'
    }
  ]

  try {
    return res.status(200).send({
      success: true,
      statusCode: 200,
      message: 'Success get all categories',
      data: skills
    })
  } catch (error: unknown) {
    const err = error as CustomError // Meng-cast error menjadi tipe CustomError

    const errResponse: ErrorType = {
      success: false,
      statusCode: err.statusCode || 500, // Gunakan statusCode dari error, jika ada
      message: err.message || 'An unknown error occurred',
      data: null
    }

    // Optional: Logging stack trace untuk debugging
    if (err.stack) {
      console.error('Error Stack:', err.stack)
    }

    return res.status(errResponse.statusCode).send(errResponse)
  }
}
