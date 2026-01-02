'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation' // <--- useParams adicionado

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n' // <--- Importante para corrigir a URL
import type { Locale } from '@configs/i18n' // <--- Tipo do Locale

// Component Imports
import Link from '@components/Link'
import TwoFactorAuth from '@components/dialogs/two-factor-auth'

const TwoFactorAuthenticationCard = () => {
  // Hooks
  const { data: session } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams() // <--- Pega o idioma atual da URL (pt, en, etc)

  // State para controlar o Modal
  const [open, setOpen] = useState(false)

  // Verifica se está habilitado
  const isTwoFactorEnabled = session?.user?.twoFactorEnabled

  // Ação ao clicar no botão
  const handleClick = () => {
    if (isTwoFactorEnabled) {
      // Se já está ativo, usa o getLocalizedUrl para montar o link com o idioma correto
      const url = getLocalizedUrl('/pages/auth/two-steps-v1', locale as Locale)
      router.push(url)
    } else {
      // Se não está ativo, abre o modal para CONFIGURAR
      setOpen(true)
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Verificação em duas etapas'
          action={
            isTwoFactorEnabled ? (
              <Chip label='Ativado' color='success' size='small' />
            ) : (
              <Chip label='Desativado' color='warning' size='small' />
            )
          }
        />
        <CardContent className='flex flex-col items-start gap-6'>
          <div className='flex flex-col gap-4'>
            <Typography variant='h5' color='text.secondary'>
              {isTwoFactorEnabled
                ? 'Sua conta está protegida com a autenticação de dois fatores.'
                : 'A autenticação de dois fatores ainda não está habilitada.'}
            </Typography>
            <Typography>
              A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta, exigindo mais do que
              apenas uma senha para fazer login.
              <Link className='text-primary ml-1' href='/' onClick={e => e.preventDefault()}>
                Leia Mais.
              </Link>
            </Typography>
          </div>

          <Button variant='contained' color={isTwoFactorEnabled ? 'error' : 'primary'} onClick={handleClick}>
            {isTwoFactorEnabled ? 'Desabilitar Autenticação de Dois Fatores' : 'Habilitar Autenticação de Dois Fatores'}
          </Button>
        </CardContent>
      </Card>

      <TwoFactorAuth open={open} setOpen={setOpen} />
    </>
  )
}

export default TwoFactorAuthenticationCard
