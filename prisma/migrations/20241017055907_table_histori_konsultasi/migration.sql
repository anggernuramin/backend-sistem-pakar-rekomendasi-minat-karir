-- CreateTable
CREATE TABLE "HistoriKonsultasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minatId" TEXT NOT NULL,
    "keahlianId" TEXT NOT NULL,
    "konsultasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriKonsultasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoriKonsultasi" ADD CONSTRAINT "HistoriKonsultasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriKonsultasi" ADD CONSTRAINT "HistoriKonsultasi_konsultasiId_fkey" FOREIGN KEY ("konsultasiId") REFERENCES "Konsultasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriKonsultasi" ADD CONSTRAINT "HistoriKonsultasi_minatId_fkey" FOREIGN KEY ("minatId") REFERENCES "Minat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriKonsultasi" ADD CONSTRAINT "HistoriKonsultasi_keahlianId_fkey" FOREIGN KEY ("keahlianId") REFERENCES "Keahlian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
