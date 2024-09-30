import { Request, Response } from 'express'
import { ISkill } from '../interfaces/skill.interface'
import { successResponse, errorResponse } from '../helpers/apiResponse'

export const getSkills = async (req: Request, res: Response): Promise<any> => {
  const skills: ISkill[] = [
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
    successResponse<ISkill[]>(res, 200, 'Success get all skills', skills)
  } catch (error) {
    console.log('🚀 ~ getSkills ~ error:', error)
    errorResponse(res, 500, "Can't get skills")
  }
}
