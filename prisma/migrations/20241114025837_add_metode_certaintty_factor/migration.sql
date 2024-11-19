/*
  Warnings:

  - Added the required column `certaintyFactor` to the `BasisAturan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BasisAturan" ADD COLUMN     "certaintyFactor" DOUBLE PRECISION NOT NULL;
