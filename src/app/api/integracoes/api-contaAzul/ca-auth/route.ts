import { NextResponse } from 'next/server'

// Não precisamos mais do Prisma aqui, pois as chaves estão no .env
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const empresaIdParam = searchParams.get('empresaId')
  const empresaId = empresaIdParam ? parseInt(empresaIdParam) : null

  if (!empresaId) {
    return NextResponse.json({ error: 'Faltando empresaId' }, { status: 400 })
  }

  // 1. Pegar credenciais do .env
  const clientId = process.env.CONTA_AZUL_CLIENT_ID
  const serverHost = process.env.NEXT_PUBLIC_SERVER_HOST || process.env.NEXT_PUBLIC_APP_URL

  // Validação de segurança para o desenvolvedor não esquecer
  if (!clientId || !serverHost) {
    console.error("❌ ERRO: Variáveis de ambiente não configuradas.")
    
return NextResponse.json({ error: 'Erro de configuração no servidor (ENV)' }, { status: 500 })
  }

  // 2. Montar URL de Callback (Essa URL deve ser idêntica no ca-callback)
  const redirectUri = `${serverHost}/api/integracoes/api-contaAzul/ca-callback`
  
  const state = empresaId.toString()

  // 3. Montar parâmetros OAuth
  // CORREÇÃO: Usando o escopo longo e o endpoint de login direto
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId.trim(),
    redirect_uri: redirectUri,
    state: state,
    scope: 'openid profile aws.cognito.signin.user.admin' 
  })

  // 4. Redirecionar para URL de Autenticação (auth.contaazul.com)
  const url = `https://auth.contaazul.com/login?${params.toString()}`

  console.log('--- INICIANDO OAUTH (MODO PARCEIRO) ---')
  console.log('Empresa:', empresaId)
  console.log('Redirecionando para:', url)

  return NextResponse.redirect(url)
}
