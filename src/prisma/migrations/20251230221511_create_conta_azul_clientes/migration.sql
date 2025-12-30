-- CreateTable
CREATE TABLE "conta_azul_clientes" (
    "id" TEXT NOT NULL,
    "caId" TEXT NOT NULL,
    "idLegado" INTEGER,
    "uuidLegado" TEXT,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tipoPessoa" TEXT,
    "perfis" TEXT[],
    "observacoes" TEXT,
    "dataCriacaoCA" TIMESTAMP(3),
    "dataAlteracaoCA" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" INTEGER NOT NULL,

    CONSTRAINT "conta_azul_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conta_azul_clientes_caId_key" ON "conta_azul_clientes"("caId");

-- AddForeignKey
ALTER TABLE "conta_azul_clientes" ADD CONSTRAINT "conta_azul_clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
