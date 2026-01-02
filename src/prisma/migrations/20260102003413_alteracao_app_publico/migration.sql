/*
  Warnings:

  - You are about to drop the column `clientId` on the `integracao_conta_azul` table. All the data in the column will be lost.
  - You are about to drop the column `clientSecret` on the `integracao_conta_azul` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "integracao_conta_azul" DROP COLUMN "clientId",
DROP COLUMN "clientSecret";
