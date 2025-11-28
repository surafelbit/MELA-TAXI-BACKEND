/*
  Warnings:

  - Added the required column `newBalance` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousBalance` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `channel` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionChannel" AS ENUM ('CHAPA', 'CASH', 'BANK_TRANSFER', 'AGENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "description" TEXT,
ADD COLUMN     "initiatedById" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "newBalance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "previousBalance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'SUCCESS',
DROP COLUMN "channel",
ADD COLUMN     "channel" "TransactionChannel" NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
