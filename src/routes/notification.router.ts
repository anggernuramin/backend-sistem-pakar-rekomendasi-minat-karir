import { Router } from 'express'
import { requireRoles } from '../middlewares/auth.middleware'
import { deleteNotification, getAllNotification, readNotification } from '../controllers/notification.controller'

export const NotificationRouter: Router = Router()

NotificationRouter.get('/', requireRoles(['admin']), getAllNotification)
NotificationRouter.post('/', requireRoles(['admin']), readNotification)
NotificationRouter.delete('/:id', requireRoles(['admin']), deleteNotification)
