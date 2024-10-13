// import express, { Application, Request, Response, NextFunction } from 'express'
// import cors from 'cors'
// import cookieParser from 'cookie-parser'
// import routes from './routes'
// import { authorizationToken } from './helpers/authorization'

// const app: Application = express()
// const port: number = 3000

// // middleware untuk access token/get token dan otorisasi saat user call endpoint/api
// app.use(authorizationToken)
// // middleware cookie Parsing header Cookie dan isi req.cookies dengan value dari cookie (res.cookie) di browser
// app.use(cookieParser())
// // routes
// routes(app)

// // middleware
// app.use(express.json())
// const corsOptions = {
//   origin: '*',
//   credentials: true
// }

// app.use(cors(corsOptions))
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Methods', '*')
//   res.setHeader('Access-Control-Allow-Headers', '*')

//   next()
// })

// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`)
// })

// Masalah yang Anda alami ketikan menggunakan configurasi diatas adalah disebabkan oleh kebijakan CORS (Cross-Origin Resource Sharing) saat mencoba membuat permintaan dari frontend (http://localhost:5173) ke backend (https://403xsccj-3000.asse.devtunnels.ms). Kesalahan ini terjadi karena permintaan dengan withCredentials: true memerlukan konfigurasi CORS yang tepat pada server agar dapat mengizinkan pengiriman kredensial (seperti cookies atau header otorisasi).

import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes'
import { authorizationToken } from './helpers/authorization'

const app: Application = express()
const port: number = 3000

// Middleware untuk menangani otorisasi dan parsing token
app.use(authorizationToken)

// Middleware untuk parsing cookies
app.use(cookieParser())

// Aktifkan parsing JSON
app.use(express.json())

// Konfigurasi opsi CORS tambahkan method patch
const corsOptions = {
  origin: 'http://localhost:5173', // Tentukan asal frontend yang diizinkan
  credentials: true, // Izinkan kredensial (cookies, header otorisasi, dll.)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] // Izinkan metode HTTP
}

// Terapkan middleware CORS
app.use(cors(corsOptions))

// Definisikan rute
routes(app)

// Jalankan server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
