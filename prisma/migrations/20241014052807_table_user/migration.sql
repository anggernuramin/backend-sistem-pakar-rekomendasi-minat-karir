/*
  Warnings:

  - Added the required column `description` to the `Keahlian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Keahlian" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Minat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Minat_pkey" PRIMARY KEY ("id")
);
