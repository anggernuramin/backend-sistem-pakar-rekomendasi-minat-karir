<!-- Migrasi Menggunakan ORM prisma -->
1. install prisma ``npm install prisma --save-dev``
2. initial prisma ``npx prisma init`` akan membuatkan folder prisma yang berisi file schema.prisma
di file .env dibuatkan variabel DATABASE_URL=.....
3. buat migration dengan ``npx prisma migrate dev nama_migrasi``
   maka akan dibuatkan folder migrations didalam folder prisma yang berisi hasil convert isi schema.prisma menjadi syntax postgres sql. yaitu nama file migrasi dan migration.sql
4. install prisma client untuk berkomunikasi dengan database ``npm install @prisma/client``
5. jalankan project express ``npm run dev``
6. buka prisma studio untuk melihat isi tabel ``npx prisma studio`` default post 5500

<!-- Jika terdapat perubahan di schema.prisma  -->
1. maka buat migrastion ulang ``npx prisma migrate dev nama_migrasi`` 
2. update db agar sync dengan migrasi prisma, (misal di schema menambahkan tabel maka perlu push ke postgres agar update dengan perintah) ``npx prisma db push``
