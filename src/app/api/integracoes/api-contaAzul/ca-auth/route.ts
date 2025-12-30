import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const empresaIdParam = searchParams.get('empresaId')
  const empresaId = empresaIdParam ? parseInt(empresaIdParam) : null

  if (!empresaId) return NextResponse.json({ error: 'Faltando empresaId' }, { status: 400 })

  const config = await prisma.integracaoContaAzul.findUnique({ where: { empresaId } })

  if (!config || !config.clientId) {
    return NextResponse.json({ error: 'Configure o Client ID primeiro' }, { status: 400 })
  }

  // URL DE RETORNO (Ngrok)
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integracoes/api-contaAzul/ca-callback`
  
  const state = empresaId.toString()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId.trim(),
    redirect_uri: redirectUri,
    state: state,
    // AQUI ESTÁ A CORREÇÃO: Usamos o escopo que funcionou no seu link manual
    // Nota: O URLSearchParams troca os espaços por '+' automaticamente
    scope: 'openid profile aws.cognito.signin.user.admin' 
  })

  // Usamos o endpoint de login direto
  const url = `https://auth.contaazul.com/login?${params.toString()}`

  console.log("Redirecionando para:", url) 

  return NextResponse.redirect(url)
}
