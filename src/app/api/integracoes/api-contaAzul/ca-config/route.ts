import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Busca config
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaIdParam = searchParams.get('empresaId')
    
    // Converte para Inteiro
    const empresaId = empresaIdParam ? parseInt(empresaIdParam) : null

    // Validação de segurança
    if (!empresaId || isNaN(empresaId)) {
      return NextResponse.json({ error: 'Faltando empresaId válido' }, { status: 400 })
    }

    const config = await prisma.integracaoContaAzul.findUnique({
      where: { empresaId } 
    })

    // Retorna a config ou null (se não existir, o front trata)
    return NextResponse.json(config || {})

  } catch (error) {
    console.error("Erro GET Config:", error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST: Salva config
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { client_id, client_secret, empresaId } = body

    // AJUSTE DE SEGURANÇA: Garante que é número
    const idNumerico = Number(empresaId)

    if (!idNumerico || isNaN(idNumerico)) {
      return NextResponse.json({ error: 'Faltando empresaId válido' }, { status: 400 })
    }

    const config = await prisma.integracaoContaAzul.upsert({
      where: { empresaId: idNumerico }, // Usa o ID numérico
      update: { 
        clientId: client_id, 
        clientSecret: client_secret 
      },
      create: { 
        empresaId: idNumerico, 
        clientId: client_id, 
        clientSecret: client_secret 
      }
    })

    return NextResponse.json(config)

  } catch (error) {
    console.error("Erro POST Config:", error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}
