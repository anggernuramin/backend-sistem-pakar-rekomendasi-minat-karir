/*
  Warnings:

  - A unique constraint covering the columns `[karirId]` on the table `BasisAturan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BasisAturan_karirId_keahlianId_minatId_key";

-- CreateIndex
CREATE UNIQUE INDEX "BasisAturan_karirId_key" ON "BasisAturan"("karirId");
