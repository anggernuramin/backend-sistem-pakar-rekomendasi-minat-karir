import { Router } from 'express'
import { addSkill, getSkills } from '../controllers/skill.controller'
import { validateSkill } from '../validations/skill.validation'

export const SkillRouter: Router = Router()

SkillRouter.get('/', getSkills)
SkillRouter.post('/', validateSkill, addSkill)
