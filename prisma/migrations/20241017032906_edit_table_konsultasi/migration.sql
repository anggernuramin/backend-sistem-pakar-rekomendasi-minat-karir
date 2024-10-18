/*
  Warnings:

  - You are about to drop the column `karirId` on the `Konsultasi` table. All the data in the column will be lost.
  - Added the required column `hasil` to the `Konsultasi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Konsultasi" DROP CONSTRAINT "Konsultasi_karirId_fkey";

-- AlterTable
ALTER TABLE "Konsultasi" DROP COLUMN "karirId",
ADD COLUMN     "hasil" JSONB NOT NULL;
