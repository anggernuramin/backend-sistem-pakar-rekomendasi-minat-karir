import { Router } from 'express'
import { getSkills } from '../controllers/skill.controller'

export const SkillRouter: Router = Router()

SkillRouter.get('/', getSkills)
