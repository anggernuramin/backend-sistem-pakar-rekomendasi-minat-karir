import { Application, Router } from 'express'
import { UserRouter } from './user.router'
import { AuthRouter } from './auth.router'
import { KeahlianRouter } from './keahlian.router'
import { MinatRouter } from './minat.router'
import { BasisAturanRouter } from './basisAturan.router'
import { KonsultasiRouter } from './konsultasi.router'
import { HistoriKonsultasiRouter } from './historiKonsultasi.router'
import { NotificationRouter } from './notification.router'
import { KarirRouter } from './karir.router'

// main router
const _routes: Array<[String, Router]> = [
  ['/api/users', UserRouter],
  ['/api/auth', AuthRouter],
  ['/api/keahlian', KeahlianRouter],
  ['/api/minat', MinatRouter],
  ['/api/karir', KarirRouter],
  ['/api/basis-aturan', BasisAturanRouter],
  ['/api/konsultasi', KonsultasiRouter],
  ['/api/histori-konsultasi', HistoriKonsultasiRouter],
  ['/api/notification', NotificationRouter]
]

const routes = (app: Application) => {
  _routes.forEach((route: [any, Router]) => {
    const [path, router] = route
    app.use(path, router)
    // ini sama saja dengan app.use("/task", TaskRouter)
  })
}

export default routes
