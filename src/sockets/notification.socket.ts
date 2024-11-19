/* eslint-disable prefer-const */
import { wss } from '../../src'
import WebSocket from 'ws'
import { prisma } from '../config/environment'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

let queueList: { id: string; queueNumber: number }[] = []
let lastKonsultasiId: string | null

// Fungsi untuk mengirim notifikasi terbaru ke semua client
export const broadcastNotification = async () => {
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

  try {
    const unreadNotificationCount = formattedNotifications.filter((notif) => !notif.status)

    const notification = {
      type: 'notification',
      count: unreadNotificationCount.length,
      data: unreadNotificationCount
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification))
      }
    })
  } catch (error) {
    console.log('🚀 ~ broadcastNotification error:', error)
  }
}

// Function to broadcast new consultation alert to all clients only when a new consultation is created
// di trigger ketika di controller create notification
export const broadcastNewConsultationAlert = async () => {
  const latestConsultation = await prisma.notification.findFirst({
    where: { status: false },
    include: { user: true },
    orderBy: { tanggal: 'desc' }
  })

  if (latestConsultation && latestConsultation.id !== lastKonsultasiId) {
    lastKonsultasiId = latestConsultation.id // Update last notified consultation ID

    const latestConsultationMessage = {
      type: 'latestKonsultasi',
      data: {
        id: latestConsultation.id,
        message: `${latestConsultation.user.name} melakukan konsultasi ${formatDistanceToNow(
          new Date(latestConsultation.tanggal),
          {
            addSuffix: true,
            locale: idLocale
          }
        )}`
      }
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(latestConsultationMessage))
      }
    })
  }
}

// Fungsi untuk mengirim data antrian terbaru ke semua client
export const broadcastQueue = () => {
  const queueData = {
    type: 'queue',
    data: queueList
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(queueData))
    }
  })
}
