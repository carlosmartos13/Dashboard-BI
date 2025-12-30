/*
  Warnings:

  - A unique constraint covering the columns `[contratoId]` on the table `conta_azul_clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conta_azul_clientes" ADD COLUMN     "contratoId" TEXT,
ADD COLUMN     "contratoInicio" TIMESTAMP(3),
ADD COLUMN     "contratoNumero" INTEGER,
ADD COLUMN     "contratoStatus" TEXT,
ADD COLUMN     "contratoVencimento" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "conta_azul_clientes_contratoId_key" ON "conta_azul_clientes"("contratoId");
