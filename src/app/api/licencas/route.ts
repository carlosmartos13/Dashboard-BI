import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10') 
    const skip = (page - 1) * limit

    console.log(`--- API GET: Buscando Matrizes (Página ${page}) ---`)

    // 1. Busca APENAS as Matrizes (Linhas principais)
    const matrizes = await prisma.pdvLicencaFilial.findMany({
      where: {
        matriz: true // <--- REGRA DE OURO: Só lista quem é matriz
      },
      skip: skip,
      take: limit,
      include: {
        // Traz o Grupo para pegar os contadores totais
        grupo: {
          include: {
            // Traz as filiais "irmãs" para exibir no expandir
            filiais: {
              where: {
                matriz: false // Não traz a matriz de novo, só as filiais
              },
              orderBy: {
                codFilial: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        dataCadastroApi: 'desc'
      }
    })

    // Contagem para paginação (Conta quantas matrizes existem)
    const total = await prisma.pdvLicencaFilial.count({
      where: { matriz: true }
    })

    return NextResponse.json({
      data: matrizes,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error("ERRO API:", error)
    return NextResponse.json({ message: 'Erro ao buscar licenças' }, { status: 500 })
  }
}
