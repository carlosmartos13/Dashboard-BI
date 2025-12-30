import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client' // Adicionei 'Prisma' aqui para tipagem se precisar

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10') 
    const search = searchParams.get('search') // 1. LER O PARÂMETRO
    
    const skip = (page - 1) * limit

    console.log(`--- API GET: Buscando Matrizes (Pág ${page} | Busca: "${search || ''}") ---`)

    // 2. CONSTRUÇÃO DO FILTRO (WHERE)
    // Começamos com a regra base: TEM que ser matriz
   // ... (início da função GET)
   
   
    
    // ...

    const whereClause: Prisma.PdvLicencaFilialWhereInput = {
      matriz: true
    }

    if (search) {
      // 1. Remove pontuação para buscar no banco (Ex: "62.871" vira "62871")
      const searchClean = search.replace(/\D/g, '')

      // 2. Verifica se é um número
      const isNumeric = !isNaN(Number(searchClean)) && searchClean.length > 0
      
      // 3. PROTEÇÃO CRÍTICA: 
      // Só buscamos nas colunas Int (codFilial/codGrupo) se o número tiver menos de 10 dígitos.
      // Se tiver mais (ex: CNPJ com 14), estoura o limite do Int e quebra a query.
      const isSmallNumber = isNumeric && searchClean.length < 10

      // 4. Define o termo para buscar no Documento
      // Se conseguiu limpar (é CNPJ/CPF), usa o limpo. Se é texto ("abc"), usa o original.
      const docTerm = searchClean.length > 0 ? searchClean : search

      whereClause.AND = [
        {
          OR: [
            // Busca por Nome (Texto)
            { nome: { contains: search, mode: 'insensitive' } },

            // Busca por Documento (Texto String)
            // Aqui ele vai achar "62871119000197" no banco
            { documento: { contains: docTerm } },

            // Busca por IDs (Inteiros) - SÓ SE FOR NÚMERO PEQUENO
            ...(isSmallNumber ? [{ codFilial: Number(searchClean) }] : []),
            ...(isSmallNumber ? [{ codGrupo: Number(searchClean) }] : []),
          ]
        }
      ]
    }
    
    // ... (restante do código: prisma.findMany)

    // 3. BUSCA NO BANCO COM O FILTRO
    const matrizes = await prisma.pdvLicencaFilial.findMany({
      where: whereClause, // <--- Usamos o filtro dinâmico aqui
      skip: skip,
      take: limit,
      include: {
        grupo: {
          include: {
            filiais: {
              where: {
                matriz: false 
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

    // 4. CONTAGEM TOTAL (CORRIGIDO)
    // IMPORTANTE: O count também precisa receber o 'whereClause'
    // Se não, ele vai contar 1000 registros, mas sua busca só retornou 2, bugando a paginação.
    const total = await prisma.pdvLicencaFilial.count({
      where: whereClause 
    })

    return NextResponse.json({
      data: matrizes,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit) || 1 // Evita divisão por zero/NaN
      }
    })

  } catch (error: any) {
    console.error("ERRO API:", error)
    return NextResponse.json({ message: 'Erro ao buscar licenças' }, { status: 500 })
  }
}
