import { Application, Router } from 'express'
import { UserRouter } from './user.router'
import { AuthRouter } from './auth.router'
import { KeahlianRouter } from './keahlian.router'
import { MinatRouter } from './minat.router'

// main router
const _routes: Array<[String, Router]> = [
  ['/api/users', UserRouter],
  ['/api/auth', AuthRouter],
  ['/api/keahlian', KeahlianRouter],
  ['/api/minat', MinatRouter]
]

const routes = (app: Application) => {
  _routes.forEach((route: [any, Router]) => {
    const [path, router] = route
    app.use(path, router)
    // ini sama saja dengan app.use("/task", TaskRouter)
  })
}

export default routes
