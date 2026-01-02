'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation' // Added useSearchParams

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
// ... (imports de UI mantidos)
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { OTPInput } from 'input-otp'
import type { SlotProps } from 'input-otp'
import classnames from 'classnames'
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import { getLocalizedUrl } from '@/utils/i18n'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import styles from '@/libs/styles/inputOtp.module.css'
import type { Locale } from '@configs/i18n'

// ... (Slot e FakeCaret components mantidos iguais) ...
const Slot = (props: SlotProps) => {
  return (
    <div className={classnames(styles.slot, { [styles.slotActive]: props.isActive })}>
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}
const FakeCaret = () => (
  <div className={styles.fakeCaret}>
    <div className='w-px h-5 bg-textPrimary' />
  </div>
)

const TwoStepsV1 = () => {
  const { lang: locale } = useParams()
  const router = useRouter()
  const { data: session, update } = useSession()

  // Detecta se estamos no modo de LOGIN PENDENTE
  const isLoginVerification = session?.user?.isTwoFactorPending

  const [otp, setOtp] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) return
    setLoading(true)

    try {
      // Define qual API chamar e qual ação tomar baseado no modo
      const apiUrl = isLoginVerification
        ? '/api/auth/2fa/login-check' // API nova para verificar login
        : '/api/auth/2fa/disable' // API antiga para desativar

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp })
      })

      const data = await res.json()

      if (res.ok) {
        // SUCESSO!
        if (isLoginVerification) {
          // MODO LOGIN: Avisa o NextAuth que o 2FA foi verificado
          // Isso chama o callback JWT e remove a flag 'isTwoFactorPending'
          await update({ isTwoFactorVerified: true })
          setFeedback({ open: true, message: 'Login verificado! Redirecionando...', severity: 'success' })
          router.refresh()
          setTimeout(() => router.replace(getLocalizedUrl('/', locale as Locale)), 500) // Vai para home
        } else {
          // MODO DESATIVAR (Código anterior)
          await update({ twoFactorEnabled: false })
          setFeedback({ open: true, message: '2FA Desativado.', severity: 'success' })
          router.refresh()
          setTimeout(() => router.replace(getLocalizedUrl('/pages/user-profile/security', locale as Locale)), 500)
        }
      } else {
        setFeedback({ open: true, message: data.message || 'Código inválido.', severity: 'error' })
      }
    } catch (error) {
      setFeedback({ open: true, message: 'Erro de conexão.', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Textos dinâmicos baseados no modo
  const title = isLoginVerification ? 'Verificação em duas etapas 🔒' : 'Desativar Verificação ⚠️'
  const description = isLoginVerification
    ? 'Insira o código de 6 dígitos do seu aplicativo autenticador para concluir o login.'
    : 'Para sua segurança, confirme o código do seu autenticador para desativar a proteção.'
  const buttonText = isLoginVerification ? 'Verificar e Entrar' : 'Confirmar Desativação'
  const buttonColor = isLoginVerification ? 'primary' : 'error'

  return (
    <AuthIllustrationWrapper>
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={feedback.severity} variant='filled'>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>{title}</Typography>
            <Typography>{description}</Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <OTPInput
                onChange={setOtp}
                value={otp ?? ''}
                maxLength={6}
                containerClassName='flex items-center'
                render={({ slots }) => (
                  <div className='flex items-center justify-between w-full gap-4'>
                    {slots.slice(0, 6).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                )}
              />
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              color={buttonColor}
              disabled={loading || !otp || otp.length < 6}
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : buttonText}
            </Button>

            {/* Link de Voltar/Cancelar dinâmico */}
            {!isLoginVerification && (
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography
                  color='primary.main'
                  component={Link}
                  href={getLocalizedUrl('/pages/user-profile/security', locale as Locale)}
                >
                  Cancelar
                </Typography>
              </div>
            )}
            {isLoginVerification && (
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography color='text.secondary' className='text-sm'>
                  Não consegue acessar? Tente seus códigos de backup.
                </Typography>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default TwoStepsV1
