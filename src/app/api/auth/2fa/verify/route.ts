import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import speakeasy from 'speakeasy'
import crypto from 'crypto' // <--- Import nativo do Node.js
import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { token } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: 'Configuração de 2FA não iniciada.' }, { status: 400 })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    })

    if (verified) {
      // --- NOVO: GERAR BACKUP CODES ---
      // Gera 10 códigos de 8 caracteres hexadecimais
      const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase())

      // Salva no banco (separados por vírgula).
      // Em produção real, o ideal seria hashear isso com bcrypt antes de salvar, igual senha.
      const backupCodesString = backupCodes.join(',')

      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          twoFactorEnabled: true,
          twoFactorBackupCodes: backupCodesString
        }
      })

      // Retorna os códigos para o frontend mostrar ao usuário
      return NextResponse.json({
        message: '2FA Ativado com sucesso!',
        backupCodes: backupCodes
      })
    } else {
      return NextResponse.json({ message: 'Código inválido.' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
