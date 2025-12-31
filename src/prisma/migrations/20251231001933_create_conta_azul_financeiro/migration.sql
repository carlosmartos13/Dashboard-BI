-- CreateTable
CREATE TABLE "conta_azul_recebimentos" (
    "id" TEXT NOT NULL,
    "id_ca_receber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "Venda_CA" TEXT NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "Venda_Status" TEXT NOT NULL,
    "Venda_A_Receber" DOUBLE PRECISION NOT NULL,
    "Venda_Pago" DOUBLE PRECISION NOT NULL,
    "Venda_dtCriacao" TIMESTAMP(3) NOT NULL,
    "Venda_DtUpdate" TIMESTAMP(3) NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_nome" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conta_azul_recebimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conta_azul_recebimentos_id_ca_receber_key" ON "conta_azul_recebimentos"("id_ca_receber");

-- AddForeignKey
ALTER TABLE "conta_azul_recebimentos" ADD CONSTRAINT "conta_azul_recebimentos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "conta_azul_clientes"("caId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conta_azul_recebimentos" ADD CONSTRAINT "conta_azul_recebimentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
