/*
  Warnings:

  - You are about to drop the column `cretedAt` on the `Konsultasi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Konsultasi" DROP COLUMN "cretedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
