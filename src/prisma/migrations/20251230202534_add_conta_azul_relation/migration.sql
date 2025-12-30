-- CreateTable
CREATE TABLE "integracao_conta_azul" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresIn" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" INTEGER NOT NULL,

    CONSTRAINT "integracao_conta_azul_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integracao_conta_azul_empresaId_key" ON "integracao_conta_azul"("empresaId");

-- AddForeignKey
ALTER TABLE "integracao_conta_azul" ADD CONSTRAINT "integracao_conta_azul_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
