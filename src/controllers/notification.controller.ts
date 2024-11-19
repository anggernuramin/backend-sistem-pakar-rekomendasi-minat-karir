import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../helpers/apiResponse'
import { prisma } from '../config/environment'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
// import { broadcastNotification } from '../../src'
import { checkDataById } from '../services/checkDataById.service'
import { broadcastNewConsultationAlert, broadcastNotification } from '../sockets/notification.socket'

export const getAllNotification = async (req: Request, res: Response): Promise<any> => {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        user: true
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    // Format each notification's created date to a relative time (e.g., "2 hours ago")
    const formattedNotifications = notifications.map((notification) => ({
      ...notification,
      message: `${notification.user.name} melakukan konsultasi`,
      tanggal: formatDistanceToNow(new Date(notification.tanggal), {
        addSuffix: true,
        locale: idLocale
      })
    }))
    await broadcastNotification()
    return successResponse(res, 200, 'Success get all notification', formattedNotifications)
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed get all notification', error.message)
  }
}

export const readNotification = async (req: Request, res: Response): Promise<any> => {
  try {
    const { notificationId } = req.body

    if (!notificationId) {
      return errorResponse(res, 404, 'Notification not found')
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: true }
      })
    }
    await broadcastNotification()

    return successResponse(res, 200, 'Success mark notifications as read', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to mark notifications as read', error.message)
  }
}

export const deleteNotification = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id
  const notification = await checkDataById(id, 'notification')

  if (!notification) {
    return errorResponse(res, 404, 'Notification not found')
  }

  try {
    await prisma.notification.delete({
      where: {
        id
      }
    })
    await broadcastNotification()
    return successResponse<any>(res, 200, 'Success delete notification', [])
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed delete notification', error.message)
  }
}

export const createNotification = async (
  message: string,
  status: boolean,
  userId: string,
  tanggal: Date
): Promise<any> => {
  try {
    await prisma.notification.create({
      data: {
        message,
        status, // 1 = read, 0 = unread
        userId,
        tanggal
      }
    })

    await broadcastNotification()
    await broadcastNewConsultationAlert()
    return true
  } catch (error: any) {
    return error.message
  }
}
