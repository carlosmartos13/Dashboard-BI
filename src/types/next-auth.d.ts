import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      twoFactorEnabled: boolean
      isTwoFactorPending?: boolean // <--- NOVO: Indica se falta digitar o código
      role?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    twoFactorEnabled: boolean
    isTwoFactorPending?: boolean // <--- NOVO
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    twoFactorEnabled: boolean
    isTwoFactorPending?: boolean // <--- NOVO
    role?: string
  }
}
