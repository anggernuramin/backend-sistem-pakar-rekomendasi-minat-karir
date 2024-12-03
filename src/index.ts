import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes'
import WebSocket, { WebSocketServer } from 'ws'
import { authorizationToken } from './helpers/authorization'
import path from 'path'
import { broadcastNotification } from './sockets/notification.socket'

const app: Application = express()
const port: string = process.env.PORT || '3000'

// Aktifkan parsing JSON
app.use(express.json())

// Konfigurasi opsi CORS tambahkan method patch
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://self-karir.vercel.app', 'http://localhost:5174'], // Tentukan domain frontend yang diizinkan
  credentials: true, // Izinkan kredensial (cookies, header otorisasi, dll.)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] // Izinkan metode HTTP
}

// Middleware untuk parsing cookies
app.use(cookieParser())

// Terapkan middleware CORS
app.use(cors(corsOptions))

// Middleware untuk menangani otorisasi dan parsing token
app.use(authorizationToken)

// Menyajikan direktori uploads sebagai folder statis
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads'))) // lokasi penyimpanan asset gambar

// Definisikan rute
routes(app)

// Jalankan server
const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

export const wss = new WebSocketServer({
  server
})
// cara menjalankan via terminal untuk ngetrigger web socket server menggunakan bantuan package wscat
// wscat -c ws://localhost:3000

// Handle koneksi WebSocket dan pesan dari client
wss.on('connection', (ws: WebSocket) => {
  console.log('Client baru terhubung')

  // Kirim data notifikasi terbaru (tanpa alert konsultasi baru)
  broadcastNotification()

  // Kirim data antrian terbaru
  // broadcastQueue()

  // Menerima pesan dari client
  ws.on('message', (message: string) => {
    const parsedMessage = JSON.parse(message)

    // Jika pesan berupa nomor antrian
    // if (parsedMessage.type === 'queue') {
    //   const queueNumber = parsedMessage.queueNumber
    //   const newQueue = { id: Date.now().toString(), queueNumber }

    //   // Tambahkan nomor antrian ke daftar
    //   queueList.push(newQueue)

    //   // Kirim data antrian terbaru ke semua client
    //   broadcastQueue()
    // }

    // Jika pesan berupa permintaan untuk notifikasi
    if (parsedMessage.type === 'notification') {
      broadcastNotification()
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})
