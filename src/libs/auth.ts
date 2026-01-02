// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        try {
          // ** Login API Call
          const res = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          if (res.status === 401) {
            throw new Error(JSON.stringify(data))
          }

          if (res.status === 200) {
            // Busca status do 2FA no banco local
            const localUser = await prisma.user.findUnique({
              where: { email: email },
              select: { twoFactorEnabled: true }
            })

            const is2faEnabled = localUser?.twoFactorEnabled || false

            // --- A CORREÇÃO ESTÁ AQUI ---
            // Você precisa RETORNAR o objeto mesclado
            return {
              ...data, // Dados da API externa (id, name, email, token)
              twoFactorEnabled: is2faEnabled,
              // Se 2FA estiver ativado, marcamos como pendente para o Middleware interceptar
              isTwoFactorPending: is2faEnabled
            }
            // -----------------------------
          }

          return null
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Login inicial
      if (user) {
        token.id = user.id
        token.twoFactorEnabled = user.twoFactorEnabled
        token.isTwoFactorPending = user.isTwoFactorPending
      }

      // 2. Atualização manual
      if (trigger === 'update' && session) {
        token = { ...token, ...session.user }

        // Se o frontend avisar que verificou o 2FA, removemos a pendência
        if (session.isTwoFactorVerified === true) {
          token.isTwoFactorPending = false
        }

        // Garante atualização do status do 2FA se vier na sessão
        if (typeof session.twoFactorEnabled === 'boolean') {
          token.twoFactorEnabled = session.twoFactorEnabled
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean
        session.user.isTwoFactorPending = token.isTwoFactorPending as boolean
      }
      return session
    }
  }
}
