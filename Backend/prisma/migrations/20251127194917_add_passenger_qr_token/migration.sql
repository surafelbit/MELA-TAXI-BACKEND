/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `Passenger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Passenger" ADD COLUMN     "qrToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_qrToken_key" ON "Passenger"("qrToken");
