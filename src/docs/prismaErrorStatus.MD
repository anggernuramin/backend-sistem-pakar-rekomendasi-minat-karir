### **Error Umum (Common Errors)**

#### **P1000**

📌 **Kesalahan**: Autentikasi gagal terhadap server database di `{database_host}`. Kredensial yang diberikan untuk `{database_user}` tidak valid.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Autentikasi database gagal. Pastikan kredensial database yang diberikan benar."
}
```

#### **P1001**

📌 **Kesalahan**: Tidak dapat menghubungi server database di `{database_host}:{database_port}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Tidak dapat menghubungi server database. Pastikan server database sedang berjalan."
}
```

#### **P1002**

📌 **Kesalahan**: Server database di `{database_host}:{database_port}` ditemukan tetapi koneksi timeout.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Koneksi ke database timeout. Silakan coba lagi nanti."
}
```

#### **P1003**

📌 **Kesalahan**: Database `{database_file_name}` tidak ditemukan di `{database_file_path}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Database tidak ditemukan. Pastikan database sudah dibuat."
}
```

#### **P1008**

📌 **Kesalahan**: Operasi timeout setelah `{time}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Operasi database terlalu lama dan dibatalkan."
}
```

#### **P1009**

📌 **Kesalahan**: Database `{database_name}` sudah ada di server `{database_host}:{database_port}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Database sudah ada, tidak dapat dibuat ulang."
}
```

#### **P1010**

📌 **Kesalahan**: Akses ditolak untuk pengguna `{database_user}` ke database `{database_name}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Akses database ditolak. Pastikan akun memiliki izin yang benar."
}
```

#### **P1011**

📌 **Kesalahan**: Gagal membuka koneksi TLS: `{message}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Gagal mengamankan koneksi ke database."
}
```

#### **P1013**

📌 **Kesalahan**: String koneksi database tidak valid. `{details}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "String koneksi database tidak valid. Periksa kembali konfigurasi koneksi."
}
```

#### **P1017**

📌 **Kesalahan**: Server telah menutup koneksi.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Koneksi ke server database terputus."
}
```

---

### **Error Prisma Client (Query Engine Errors)**

#### **P2000**

📌 **Kesalahan**: Nilai yang diberikan terlalu panjang untuk kolom `{column_name}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Data terlalu panjang untuk kolom yang ditentukan."
}
```

#### **P2001**

📌 **Kesalahan**: Data yang dicari tidak ditemukan.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Data yang diminta tidak ditemukan."
}
```

#### **P2002**

📌 **Kesalahan**: Gagal karena nilai duplikat pada `{constraint}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Data sudah ada, gunakan nilai unik yang berbeda."
}
```

#### **P2003**

📌 **Kesalahan**: Gagal karena batasan foreign key pada `{field_name}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Referensi data tidak valid, pastikan data terkait ada."
}
```

#### **P2004**

📌 **Kesalahan**: Batasan database gagal: `{database_error}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Terjadi kesalahan pada batasan database."
}
```

#### **P2012**

📌 **Kesalahan**: Data wajib pada `{path}` tidak diberikan.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Data wajib tidak boleh kosong."
}
```

#### **P2021**

📌 **Kesalahan**: Tabel `{table}` tidak ditemukan di database.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Tabel tidak ditemukan di database."
}
```

#### **P2022**

📌 **Kesalahan**: Kolom `{column}` tidak ditemukan di database.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Kolom tidak ditemukan di database."
}
```

#### **P2025**

📌 **Kesalahan**: Operasi gagal karena data terkait tidak ditemukan. `{cause}`  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Operasi gagal karena data yang dibutuhkan tidak ditemukan."
}
```

---

### **Error Prisma Migrate (Schema Engine Errors)**

#### **P3000**

📌 **Kesalahan**: Gagal membuat database: `{database_error}`.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Gagal membuat database. Periksa konfigurasi database."
}
```

#### **P3005**

📌 **Kesalahan**: Skema database tidak kosong.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Database tidak kosong, migrasi tidak dapat dilakukan."
}
```

#### **P3014**

📌 **Kesalahan**: Prisma Migrate tidak dapat membuat shadow database.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Gagal membuat database sementara untuk migrasi."
}
```

#### **P3021**

📌 **Kesalahan**: Foreign key tidak dapat dibuat pada database ini.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Database tidak mendukung foreign key."
}
```

---

### **Error Prisma Accelerate**

#### **P6002**

📌 **Kesalahan**: API Key dalam string koneksi tidak valid.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "API Key tidak valid. Periksa kembali kredensial."
}
```

#### **P6003**

📌 **Kesalahan**: Penggunaan pada paket gratis telah melebihi batas.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Batas penggunaan telah tercapai. Upgrade ke paket berbayar untuk melanjutkan."
}
```

#### **P6008**

📌 **Kesalahan**: Gagal memulai engine database.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Gagal terhubung ke database, coba lagi nanti."
}
```

#### **P6010**

📌 **Kesalahan**: Proyek Prisma Accelerate dinonaktifkan.  
🔄 **Respons ke Frontend**:

```json
{
  "error": "Prisma Accelerate dinonaktifkan. Aktifkan kembali untuk menggunakannya."
}
```

---
