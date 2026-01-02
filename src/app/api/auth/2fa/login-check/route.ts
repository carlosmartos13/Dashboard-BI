import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import speakeasy from 'speakeasy'
import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // O usuário já tem uma sessão (pendente), então podemos pegar o email
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ message: 'Erro de sessão' }, { status: 401 })

    const { token } = await req.json()
    const cleanToken = token.replace(/\s/g, '')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: '2FA não configurado.' }, { status: 400 })
    }

    // Verifica o código
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: cleanToken,
      window: 2
    })

    if (!verified) {
      // Aqui você poderia implementar a lógica de verificar os Backup Codes também
      return NextResponse.json({ message: 'Código incorreto.' }, { status: 400 })
    }

    // Se chegou aqui, o código está certo!
    return NextResponse.json({ message: 'Sucesso', success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
