-- CreateTable
CREATE TABLE "BasisAturan" (
    "id" TEXT NOT NULL,
    "karirId" TEXT NOT NULL,
    "keahlianId" TEXT NOT NULL,
    "minatId" TEXT NOT NULL,

    CONSTRAINT "BasisAturan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BasisAturan_karirId_keahlianId_minatId_key" ON "BasisAturan"("karirId", "keahlianId", "minatId");

-- AddForeignKey
ALTER TABLE "BasisAturan" ADD CONSTRAINT "BasisAturan_karirId_fkey" FOREIGN KEY ("karirId") REFERENCES "Karir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasisAturan" ADD CONSTRAINT "BasisAturan_keahlianId_fkey" FOREIGN KEY ("keahlianId") REFERENCES "Keahlian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasisAturan" ADD CONSTRAINT "BasisAturan_minatId_fkey" FOREIGN KEY ("minatId") REFERENCES "Minat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
