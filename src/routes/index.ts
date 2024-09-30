import { Application, Router } from 'express'
import { SkillRouter } from './skill.router'

// main router
const _routes: Array<[String, Router]> = [['/api/skills', SkillRouter]]

const routes = (app: Application) => {
  _routes.forEach((route: [any, Router]) => {
    const [path, router] = route
    app.use(path, router)
    // ini sama saja dengan app.use("/task", TaskRouter)
  })
}

export default routes
