import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getValidToken(empresaId: number) {
  // 1. Busca a configuração no banco
  const config = await prisma.integracaoContaAzul.findUnique({
    where: { empresaId }
  })

  if (!config || !config.accessToken || !config.refreshToken) {
    throw new Error('Integração não configurada ou tokens ausentes.')
  }

  // 2. Verifica se está expirado
  // O updatedAt diz quando o token foi salvo. O expiresIn diz quantos segundos dura (3600).
  // Vamos dar uma margem de segurança de 5 minutos (300 segundos) para não correr risco.
  const now = new Date()
  const tokenDate = new Date(config.updatedAt)
  const expirationSeconds = config.expiresIn || 3600
  const expirationDate = new Date(tokenDate.getTime() + expirationSeconds * 1000)

  // Se "Agora" for maior que "Data de Expiração - 5 minutos", precisa renovar
  const isExpired = now.getTime() > expirationDate.getTime() - 300000

  if (!isExpired) {
    return config.accessToken // Token ainda vale, retorna ele mesmo
  }

  // 3. O Token venceu! Vamos renovar (Refresh Flow)
  console.log(`Token da empresa ${empresaId} expirou. Renovando...`)

  const cleanClientId = config.clientId.trim()
  const cleanClientSecret = config.clientSecret.trim()
  const basicAuth = Buffer.from(`${cleanClientId}:${cleanClientSecret}`).toString('base64')

  try {
    const response = await fetch('https://auth.contaazul.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: config.refreshToken
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro ao renovar token:', data)
      throw new Error('Falha ao renovar token Conta Azul')
    }

    // 4. Salva os novos tokens no banco
    await prisma.integracaoContaAzul.update({
      where: { empresaId },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token, // O refresh token TAMBÉM muda
        expiresIn: data.expires_in

        // O updatedAt atualiza sozinho graças ao @updatedAt do Prisma
      }
    })

    console.log('Token renovado com sucesso!')

    return data.access_token
  } catch (error) {
    console.error('Erro crítico na renovação:', error)
    throw error
  }
}
