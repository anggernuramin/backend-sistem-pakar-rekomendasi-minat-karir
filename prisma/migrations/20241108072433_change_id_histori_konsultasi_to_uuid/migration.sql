/*
  Warnings:

  - You are about to drop the column `createdAt` on the `HistoriKonsultasi` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Konsultasi` table. All the data in the column will be lost.
  - Added the required column `tanggalHistoriKonsultasi` to the `HistoriKonsultasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalKonsultasi` to the `Konsultasi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HistoriKonsultasi" DROP COLUMN "createdAt",
ADD COLUMN     "tanggalHistoriKonsultasi" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Konsultasi" DROP COLUMN "createdAt",
ADD COLUMN     "tanggalKonsultasi" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
