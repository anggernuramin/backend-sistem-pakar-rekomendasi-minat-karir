/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Karir` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Keahlian` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Minat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Karir_name_key" ON "Karir"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Keahlian_name_key" ON "Keahlian"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Minat_name_key" ON "Minat"("name");
