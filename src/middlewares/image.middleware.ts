// Cara Kerja uploud gambar
// 1. Dari Frontend
// - Gambar dikirim dalam format biner menggunakan `FormData` dengan pengaturan `enctype` `multipart/form-data`.

// 2. Dari Backend
// - Gambar yang dikirim dari frontend ditangkap dengan `req.file`
//  - Menggunakan menggunakan multer (middleware), lalu file gambar disimpan di file system (artinya di directori repo    backend).
//  - Kemudian path name dari file system disimpan di database.
// - Backend mengirimkan informasi path name file yang sudah disimpan didatabase ke frontend, termasuk URL untuk mengakses gambar.
// - Frontend menampilkan gambar menggunakan URL yang diterima dari backend.

import path from 'path'
import fs from 'fs'
import multer from 'multer'

const createMainDirectory = () => {
  // Path ke direktori uploads
  const uploadDir = path.join(__dirname, '../uploads')
  // Menggunakan path.join dari modul path untuk menggabungkan bagian-bagian dari path file.
  // __dirname: Merupakan variabel global yang berisi path dari direktori tempat file saat ini berada.
  // '../uploads': Menunjukkan bahwa kita ingin menuju direktori uploads yang berada satu tingkat di atas direktori saat ini.

  // Membuat direktori jika belum ada
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  // fs.existsSync: Merupakan fungsi dari modul fs yang memeriksa apakah direktori atau file tertentu ada. Jika tidak ada, fungsi ini mengembalikan false.
  // fs.mkdirSync: Fungsi ini digunakan untuk membuat direktori baru.
  // Kode ini memastikan bahwa direktori uploads ada sebelum kita mencoba untuk menyimpan file di dalamnya.
}

// Konfigurasi multer untuk mengunggah file
export const uploudImage = (pathDirectory: string) => {
  return multer({
    storage: multer.diskStorage({
      // Fungsi destination: Menentukan direktori tempat file akan disimpan. Di sini, kita mengembalikan path ke direktori uploads yang telah kita buat sebelumnya.
      destination: (req, file, cb) => {
        // cb(null, ...): Memanggil callback dengan null untuk menunjukkan bahwa tidak ada error dan mengirimkan path tujuan.
        cb(null, path.join(__dirname, pathDirectory))
      },
      filename: (req, file, cb) => {
        // Fungsi filename: Menentukan nama file yang akan disimpan. dalam kode ini membuat nama file yang unik dengan menggabungkan timestamp saat ini (Date.now()) dan angka acak.
        // file.originalname: Mengambil nama asli file yang diunggah.
        // Dengan demikian, nama file yang disimpan akan berbentuk timestamp-randomNumber-originalFilename
        const uniqueSuffix = new Date().toISOString().replace(/[:.-]/g, '') + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + '-' + file.originalname)
      }
    }),
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/ // ekstensi file yang valid/dibolehkan
      const mimetype = filetypes.test(file.mimetype) // mimetype adalah tipe file
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase()) // validasi jenis ekstensi gambar
      if (mimetype && extname) {
        return cb(null, true)
      }
      // message error ketika file input tidak cocok
      cb(new Error('Format gambar tidak sesuai, file harus berekstensi JPEG, JPG, PNG.'))
    }
  })
}

export const middlewareUploudImage = (nameDirectory: string, pathDirectory: string) => {
  createMainDirectory()

  switch (nameDirectory) {
    case 'user':
      if (!fs.existsSync(path.join(__dirname, `../uploads/${nameDirectory}`))) {
        fs.mkdirSync(path.join(__dirname, `../uploads/${nameDirectory}`), { recursive: true })
      }
      return uploudImage(pathDirectory)
    default:
      throw new Error('Path directory tidak valid')
  }
}
