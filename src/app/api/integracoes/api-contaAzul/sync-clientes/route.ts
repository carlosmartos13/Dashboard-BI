import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

import { getValidToken } from '@/views/empresas/settings/integracaoes/contaAzul/contaAzulAuthHelper' // Seu arquivo helper

const prisma = new PrismaClient()

// Configuração para evitar timeout em sincronizações grandes
export const maxDuration = 60 // 60 segundos (Vercel/NextJS config)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { empresaId } = body

    if (!empresaId) {
      return NextResponse.json({ error: 'EmpresaID é obrigatório' }, { status: 400 })
    }

    // 1. Garante Token Válido
    const accessToken = await getValidToken(Number(empresaId))

    // Configurações da Paginação
    const baseUrl = 'https://api-v2.contaazul.com/v1/pessoas'
    let paginaAtual = 1
    const tamanhoPagina = 20 // Traz 20 por vez para não sobrecarregar
    let temMaisPaginas = true
    let totalSincronizados = 0

    // 2. Loop de Paginação (Busca até acabar)
    while (temMaisPaginas) {
      console.log(`Buscando página ${paginaAtual}...`)

      const url = `${baseUrl}?pagina=${paginaAtual}&tamanho_pagina=${tamanhoPagina}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(`Erro na API Conta Azul: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const items = data.items || []

      // Se não vier nada, para o loop
      if (items.length === 0) {
        temMaisPaginas = false
        break
      }

      // 3. Processamento em Lote (Upsert)
      // Usamos Promise.all para salvar os 20 de uma vez (mais rápido)
      await Promise.all(
        items.map(async (cliente: any) => {
          // Tratamento de datas (se vier null, ignora)
          const dataCriacao = cliente.data_criacao ? new Date(cliente.data_criacao) : null
          const dataAlteracao = cliente.data_alteracao ? new Date(cliente.data_alteracao) : null

          return prisma.contaAzulCliente.upsert({
            where: {
              caId: cliente.id // Busca pelo ID Único da Conta Azul
            },

            // SE JÁ EXISTE: Atualiza os dados
            update: {
              nome: cliente.nome,
              documento: cliente.documento,
              email: cliente.email,
              telefone: cliente.telefone,
              ativo: cliente.ativo,
              tipoPessoa: cliente.tipo_pessoa,
              perfis: cliente.perfis || [], // Salva o array ["Cliente", "Fornecedor"]
              observacoes: cliente.observacoes_gerais,
              dataAlteracaoCA: dataAlteracao

              // Não atualizamos o createdAt nosso
            },

            // SE NÃO EXISTE: Cria novo
            create: {
              caId: cliente.id,
              idLegado: cliente.id_legado,
              uuidLegado: cliente.uuid_legado,
              nome: cliente.nome,
              documento: cliente.documento,
              email: cliente.email,
              telefone: cliente.telefone,
              ativo: cliente.ativo,
              tipoPessoa: cliente.tipo_pessoa,
              perfis: cliente.perfis || [],
              observacoes: cliente.observacoes_gerais,
              dataCriacaoCA: dataCriacao,
              dataAlteracaoCA: dataAlteracao,

              // Conecta com a sua empresa
              empresa: {
                connect: { id: Number(empresaId) }
              }
            }
          })
        })
      )

      totalSincronizados += items.length

      // Verifica se precisa buscar a próxima página
      // Se a quantidade que veio é menor que o tamanho da página, acabou
      if (items.length < tamanhoPagina) {
        temMaisPaginas = false
      } else {
        paginaAtual++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída! ${totalSincronizados} clientes processados.`,
      total: totalSincronizados
    })
  } catch (error: any) {
    console.error('Erro Sync Clientes:', error)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
