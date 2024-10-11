import { Request, Response } from 'express'
import { ISkill } from '../interfaces/skill.interface'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { validationResult } from 'express-validator'
type ValidationResultError = {
  [key: string]: '' // key-nya adalah nama field, dan value adalah array pesan error
}

const skills: ISkill[] = [
  {
    id: 1,
    name: 'Frontend',
    description: 'Frontend description'
  },
  {
    id: 2,
    name: 'Backend',
    description: 'Backend description'
  },
  {
    id: 3,
    name: 'Mobile',
    description: 'Mobile description'
  }
]

export const getSkills = async (req: Request, res: Response): Promise<any> => {
  try {
    successResponse<ISkill[]>(res, 200, 'Success get all skills', skills)
  } catch (error) {
    console.log('🚀 ~ getSkills ~ error:', error)
    errorResponse(res, 500, "Can't get skills")
  }
}

export const addSkill = async (req: Request, res: Response): Promise<any> => {
  // Validasi request body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        // error is FieldValidationError
        validationErrors[error.path] = error.msg
      }
    })
    // Gunakan errorResponse untuk mengirim response dengan status 400 dan validasi error
    return errorResponse(res, 400, 'Validasi gagal', validationErrors)
  }

  const { name, description } = req.body

  try {
    const newSkill: ISkill = {
      id: Date.now(),
      name,
      description // Make sure you include this in your ISkill interface
    }
    skills.push(newSkill)
    successResponse<ISkill[]>(res, 201, 'Skill berhasil ditambahkan', [])
  } catch (error) {
    console.log('🚀 ~ addSkill ~ error:', error)
    errorResponse(res, 500, 'Gagal menambah skill')
  }
}
