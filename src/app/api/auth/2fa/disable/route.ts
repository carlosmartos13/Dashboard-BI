import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import speakeasy from 'speakeasy'
import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { token } = await req.json()
    const cleanToken = token.replace(/\s/g, '') // Remove espaços

    // 1. Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: '2FA já está desativado.' }, { status: 400 })
    }

    // --- ÁREA DE DEBUG (OLHE NO SEU TERMINAL) ---
    console.log('--- INÍCIO DEBUG 2FA DISABLE ---')
    console.log('1. Email:', session.user.email)
    console.log('2. Secret no Banco:', user.twoFactorSecret)
    console.log('3. Token Recebido (Input):', cleanToken)

    // Gera o token que o servidor acha que deveria ser agora
    const expectedToken = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: 'base32'
    })
    console.log('4. Token Esperado pelo Servidor:', expectedToken)

    // Verifica a diferença de tempo (Delta)
    const delta = speakeasy.totp.verifyDelta({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: cleanToken,
      window: 2
    })
    console.log('5. Delta (null = falha, numero = sucesso):', delta)
    console.log('--- FIM DEBUG ---')
    // ---------------------------------------------

    const verified = delta !== null // Se delta for null, falhou. Se for objeto/número, passou.

    if (!verified) {
      return NextResponse.json(
        {
          message: `Código incorreto. Servidor esperava: ${expectedToken}, Recebeu: ${cleanToken}`
        },
        { status: 400 }
      )
    }

    // 3. Sucesso: Limpa tudo
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    })

    return NextResponse.json({ message: '2FA Desativado com sucesso!' })
  } catch (error) {
    console.error('Erro Fatal:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
