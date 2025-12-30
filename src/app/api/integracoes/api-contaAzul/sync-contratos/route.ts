import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getValidToken } from '@/views/empresas/settings/integracaoes/contaAzul/contaAzulAuthHelper'

const prisma = new PrismaClient()
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { empresaId } = body

    if (!empresaId) return NextResponse.json({ error: 'EmpresaID obrigatório' }, { status: 400 })

    const accessToken = await getValidToken(Number(empresaId))

    // Intervalo de busca (ajuste conforme necessidade)
    const dataInicioBusca = '2015-01-01'
    const dataFimBusca = '2030-12-31'

    const baseUrl = 'https://api-v2.contaazul.com/v1/contratos'
    let paginaAtual = 1
    const tamanhoPagina = 20
    let temMaisPaginas = true
    let totalProcessados = 0
    let clientesAtualizados = 0

    while (temMaisPaginas) {
      console.log(`Buscando Contratos - Página ${paginaAtual}...`)

      const params = new URLSearchParams({
        pagina: paginaAtual.toString(),
        tamanho_pagina: tamanhoPagina.toString(),
        data_inicio: dataInicioBusca,
        data_fim: dataFimBusca
      })

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Erro API CA: ${response.status} - ${txt}`)
      }

      const data = await response.json()
      // A API pode retornar 'items' ou 'itens', garantindo os dois:
      const listaContratos = data.items || data.itens || []

      if (listaContratos.length === 0) {
        temMaisPaginas = false
        break
      }

      // Processamento paralelo
      await Promise.all(
        listaContratos.map(async (contrato: any) => {
          // Se não tem ID de cliente vinculado no contrato, ignora
          if (!contrato.cliente || !contrato.cliente.id) return

          // Tratamento de datas
          const dtInicio = contrato.data_inicio ? new Date(contrato.data_inicio + 'T12:00:00') : null
          const dtVencimento = contrato.proximo_vencimento ? new Date(contrato.proximo_vencimento + 'T12:00:00') : null

          try {
            // Tenta atualizar o Cliente existente com os dados deste contrato
            await prisma.contaAzulCliente.update({
              where: {
                caId: contrato.cliente.id // Procura o cliente pelo ID da Conta Azul
              },
              data: {
                contratoId: contrato.id,
                contratoStatus: contrato.status,
                contratoNumero: contrato.numero,
                contratoInicio: dtInicio,
                contratoVencimento: dtVencimento
                // O updatedAt atualiza sozinho
              }
            })
            clientesAtualizados++
          } catch (error) {
            // Se der erro (ex: Cliente não foi sincronizado antes e não existe no banco),
            // Apenas logamos e continuamos. Não queremos quebrar o loop.
            // console.warn(`Cliente ${contrato.cliente.nome} não encontrado para vincular contrato.`)
          }
        })
      )

      totalProcessados += listaContratos.length

      if (listaContratos.length < tamanhoPagina) {
        temMaisPaginas = false
      } else {
        paginaAtual++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processo finalizado. ${totalProcessados} contratos lidos, ${clientesAtualizados} clientes atualizados.`,
      total: totalProcessados,
      atualizados: clientesAtualizados
    })
  } catch (error: any) {
    console.error('Erro Sync Contratos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
