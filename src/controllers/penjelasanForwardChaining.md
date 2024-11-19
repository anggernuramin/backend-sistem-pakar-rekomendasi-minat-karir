Untuk menerapkan metode **Forward Chaining** yang sesungguhnya, kita perlu melakukan beberapa perubahan penting pada kode yang sudah ada. Pada prinsipnya, Forward Chaining adalah inferensi bertahap, di mana kita mulai dengan **fakta** yang sudah ada (misalnya minat dan keahlian pengguna), dan kemudian kita menggunakan **aturan** untuk mencari **kesimpulan** atau **rekomendasi**. Kecocokan tidak hanya berdasarkan perhitungan skor atau persentase, tetapi lebih kepada **mengaplikasikan aturan** secara berurutan.

Berikut adalah contoh implementasi yang benar-benar sesuai dengan konsep **Forward Chaining** untuk mencari **rekomendasi karir** berdasarkan **minat** dan **keahlian**.

### Langkah-langkah:

1. **Mulai dengan fakta yang ada**: Fakta-fakta ini adalah minat dan keahlian yang dipilih oleh pengguna.
2. **Aplikasikan aturan-aturan**: Mencocokkan fakta dengan **basis aturan** yang ada.
3. **Inferensi bertahap**: Jika aturan cocok, kita terapkan dan lanjutkan untuk mencocokkan aturan lebih lanjut.
4. **Jika tidak ada kecocokan, beri error**: Jika tidak ada aturan yang cocok, kita memberikan respons error.

### Berikut adalah implementasi kode:

```typescript
import { validationResult } from 'express-validator'
import { ValidationResultError } from '../interfaces/validation.interface'
import { errorResponse, successResponse } from '../helpers/apiResponse'
import { Request, Response } from 'express'
import { checkDataById } from '../services/checkDataById.service'
import { prisma } from '../config/environment'
import { generateCustomId } from '../services/generateCustomId.service'
import { createHistoriKonsultasi } from './historiKonsultasi.controller'

export const forwardChainingCreateKonsultasi = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: ValidationResultError = {}
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        validationErrors[error.path] = error.msg
      }
    })
    return errorResponse(res, 400, 'Validation error', validationErrors)
  }

  try {
    const { userId, minatId, keahlianId, tanggalKonsultasi } = req.body

    // Validasi apakah user ada di database
    const user = await checkDataById(userId, 'user')
    if (!user) {
      return errorResponse(res, 404, 'User tidak ditemukan')
    }

    // Ambil semua basis aturan yang ada
    const allRules = await prisma.basisAturan.findMany({
      select: {
        karirId: true,
        minatId: true,
        keahlianId: true
      }
    })

    // Untuk menyimpan hasil inferensi
    let matchedKarir: string[] = [] // Daftar karir yang cocok

    // Mencocokkan minat dan keahlian dengan basis aturan
    let isMatched = true // Flag untuk menentukan apakah ada aturan yang cocok
    let appliedRules: Set<string> = new Set() // Untuk menyimpan aturan yang sudah diterapkan

    // Mulai inferensi dari fakta yang ada
    while (isMatched) {
      isMatched = false

      // Proses setiap aturan untuk mencari kecocokan dengan fakta
      for (const rule of allRules) {
        const { karirId, minatId: ruleMinat, keahlianId: ruleKeahlian } = rule

        // Cek apakah minat dan keahlian cocok dengan aturan ini dan belum diterapkan
        const minatCocok = minatId.includes(ruleMinat)
        const keahlianCocok = keahlianId.includes(ruleKeahlian)

        if (minatCocok && keahlianCocok && !appliedRules.has(karirId)) {
          // Jika ada kecocokan, tandai aturan ini sudah diterapkan
          appliedRules.add(karirId)
          matchedKarir.push(karirId)
          isMatched = true
        }
      }
    }

    // Jika tidak ada kecocokan ditemukan
    if (matchedKarir.length === 0) {
      return errorResponse(res, 404, 'Tidak ada kecocokan untuk minat dan keahlian yang dipilih.')
    }

    // Ambil informasi tentang karir yang cocok
    const recommendedKarir = await prisma.karir.findMany({
      where: {
        id: {
          in: matchedKarir
        }
      }
    })

    // Simpan hasil konsultasi
    const konsultasiId = await generateCustomId('konsultasi', 'KON')
    const konsultasiResult = await prisma.konsultasi.create({
      data: {
        id: konsultasiId,
        userId,
        hasil: recommendedKarir, // Rekomendasi karir yang cocok
        tanggalKonsultasi
      }
    })

    // Simpan ke tabel historiKonsultasi untuk setiap minat dan keahlian yang dipilih pengguna
    await createHistoriKonsultasi(minatId, keahlianId, userId, konsultasiId, tanggalKonsultasi)

    return successResponse(res, 201, 'Konsultasi berhasil', konsultasiResult)
  } catch (error: any) {
    return errorResponse(res, 500, 'Gagal melakukan konsultasi', error?.message)
  }
}
```

### Penjelasan dari kode:

1. **Validasi Input**: Pertama, validasi dilakukan untuk memastikan input yang diberikan oleh user benar dan valid.
2. **Pengambilan Basis Aturan**: Mengambil semua **basis aturan** yang berisi hubungan antara **karir**, **minat**, dan **keahlian** dari database.

3. **Proses Forward Chaining**:

   - **Fakta yang ada**: Fakta-fakta awal adalah **minat** dan **keahlian** yang dipilih oleh pengguna.
   - **Pencocokan aturan**: Kemudian, sistem akan mencocokkan fakta-fakta ini dengan aturan yang ada dalam basis aturan.
   - **Inferensi bertahap**: Setiap kali aturan yang cocok ditemukan (baik minat maupun keahlian cocok dengan aturan), karir terkait akan dimasukkan ke dalam daftar kecocokan.
   - **Looping**: Proses ini dilakukan berulang-ulang hingga tidak ada aturan yang cocok lagi (terjadi inferensi bertahap).

4. **Penanganan Kasus Tidak Ada Kecocokan**:

   - Jika setelah semua aturan diperiksa tidak ada karir yang cocok, sistem mengembalikan **error 404** dengan pesan bahwa tidak ada kecocokan.

5. **Simpan Hasil Konsultasi**:
   - Hasil akhir, yaitu daftar **karir yang cocok**, disimpan dalam tabel konsultasi dan juga dalam histori konsultasi.

### **Error Handling**:

- Jika tidak ada kecocokan ditemukan (setelah proses inferensi), sistem akan mengembalikan error dengan pesan "Tidak ada kecocokan untuk minat dan keahlian yang dipilih."

### **Keunggulan Implementasi Ini**:

- **Forward Chaining**: Ini adalah contoh yang lebih murni dari metode forward chaining, di mana kita memulai dari fakta yang ada dan kemudian mencari aturan yang relevan, dengan penerapan bertahap.
- **Multiple Matches**: Sistem ini dapat mengembalikan lebih dari satu karir yang cocok jika beberapa aturan cocok dengan minat dan keahlian yang diberikan oleh pengguna.
- **Penerapan Bertahap**: Inferensi dilakukan secara bertahap dengan terus memeriksa aturan yang cocok berdasarkan fakta yang ada.

Semoga penjelasan ini membantu dan memberikan gambaran yang jelas tentang bagaimana menerapkan **Forward Chaining** dalam sistem rekomendasi karir berdasarkan minat dan keahlian!
