import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') 

  if (!code || !state) {
    return NextResponse.json({ error: 'Código ou State inválido' }, { status: 400 })
  }

  // 1. Correção de segurança do Prisma (String -> Int)
  const empresaId = parseInt(state)
  if (isNaN(empresaId)) {
     return NextResponse.json({ error: 'ID da empresa inválido' }, { status: 400 })
  }

  const config = await prisma.integracaoContaAzul.findUnique({ where: { empresaId } })

  if (!config) return NextResponse.json({ error: 'Configuração não encontrada' })

  // Limpa espaços vazios que podem ter vindo do copiar/colar
  const cleanClientId = config.clientId.trim()
  const cleanClientSecret = config.clientSecret.trim()

  // 2. GERA O BASE64 (Exatamente como o manual pede)
  const basicAuth = Buffer.from(`${cleanClientId}:${cleanClientSecret}`).toString('base64')

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integracoes/api-contaAzul/ca-callback`
  
  try {
    // 3. URL CORRETA (auth.contaazul.com)
    const tokenResponse = await fetch('https://auth.contaazul.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`, // Envia o Base64 no Header
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Erro Conta Azul:", tokenData)
      // Se der erro, mostra na tela para facilitar o debug
      return NextResponse.json({ error: tokenData }, { status: 400 })
    }

    // Salva os tokens
    await prisma.integracaoContaAzul.update({
      where: { empresaId },
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      }
    })

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/apps/empresas/config?success=true`)

  } catch (error) {
    console.error("Erro Callback:", error)
    return NextResponse.json({ error: 'Falha na autenticação OAuth' }, { status: 500 })
  }
}
