-- CreateTable
CREATE TABLE "Konsultasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "karirId" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "cretedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Konsultasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Konsultasi" ADD CONSTRAINT "Konsultasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Konsultasi" ADD CONSTRAINT "Konsultasi_karirId_fkey" FOREIGN KEY ("karirId") REFERENCES "Karir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
