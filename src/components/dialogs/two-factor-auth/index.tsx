'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation' // <--- 1. Importar useRouter

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Box from '@mui/material/Box'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import DialogCloseButton from '../DialogCloseButton'
import type { CustomInputHorizontalData } from '@core/components/custom-inputs/types'

type TwoFactorAuthProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const data: CustomInputHorizontalData[] = [
  {
    title: (
      <div className='flex items-top gap-1'>
        <i className='tabler-settings text-xl shrink-0' />
        <Typography className='font-medium' color='text.primary'>
          Google Authenticator / Authenticator App
        </Typography>
      </div>
    ),
    value: 'app',
    isSelected: true,
    content: 'Obtenha o código de um aplicativo como o Google Authenticator ou o Microsoft Authenticator.'
  },
  {
    title: (
      <div className='flex items-top gap-1'>
        <i className='tabler-mail text-xl shrink-0' />
        <Typography className='font-medium' color='text.primary'>
          E-MAIL
        </Typography>
      </div>
    ),
    value: 'E-MAIL',
    content: 'Enviaremos um código por e-mail caso precise usar seu método de login alternativo.'
  }
]

// --- 1. COMPONENTE E-MAIL ---
const EMAILDialog = (handleAuthDialogClose: () => void) => {
  return (
    <>
      <DialogTitle variant='h5' className='flex flex-col gap-2 sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Verify Your Mobile Number for E-MAIL
        <Typography component='span' className='flex flex-col'>
          Enter your mobile phone number with country code and we will send you a verification code.
        </Typography>
      </DialogTitle>
      <DialogContent className='overflow-visible pbs-0 sm:pbe-16 sm:pli-16'>
        <CustomTextField fullWidth type='number' label='Mobile Number' placeholder='123 456 7890' />
      </DialogContent>
      <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16'>
        <Button variant='tonal' type='reset' color='secondary' onClick={handleAuthDialogClose}>
          Cancel
        </Button>
        <Button color='success' variant='contained' type='submit' onClick={handleAuthDialogClose}>
          Submit
        </Button>
      </DialogActions>
    </>
  )
}

// --- 2. COMPONENTE APP (QR Code) ---
type AppDialogProps = {
  handleClose: () => void
  qrCodeUrl: string
  token: string
  setToken: (val: string) => void
  onVerify: () => void
  loading: boolean
}

const AppDialog = ({ handleClose, qrCodeUrl, token, setToken, onVerify, loading }: AppDialogProps) => {
  return (
    <>
      <DialogTitle variant='h4' className='text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Adicionar Autenticação de Dois Fatores
      </DialogTitle>
      <DialogContent className='flex flex-col gap-6 pbs-0 sm:pli-16'>
        <div className='flex flex-col gap-2'>
          <Typography variant='h5'>Authenticator Apps</Typography>
          <Typography>
            Usando um aplicativo autenticador, escaneie o código QR. Ele gerará um código de 6 dígitos.
          </Typography>
        </div>
        <div className='flex justify-center'>
          {qrCodeUrl ? (
            <img alt='qr-code' height={150} width={150} src={qrCodeUrl} />
          ) : (
            <div className='flex justify-center items-center h-[150px] w-[150px]'>
              <CircularProgress />
            </div>
          )}
        </div>
        <div className='flex flex-col gap-4'>
          <Alert severity='warning' icon={false}>
            <AlertTitle>Google APP Authenticator</AlertTitle>
            Se tiver dificuldades com o QR Code, selecione entrada manual no seu app.
          </Alert>
          <CustomTextField
            fullWidth
            label='Código de Autenticação'
            placeholder='123456'
            value={token}
            onChange={e => setToken(e.target.value)}
          />
        </div>
      </DialogContent>
      <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16'>
        <Button variant='tonal' color='secondary' onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          color='success'
          variant='contained'
          onClick={onVerify}
          disabled={loading || token.length < 6}
          endIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-check' />}
        >
          Verificar e Ativar
        </Button>
      </DialogActions>
    </>
  )
}

// --- 3. COMPONENTE CÓDIGOS DE BACKUP ---
type BackupCodeDialogProps = {
  codes: string[]
  onFinish: () => void
}

const BackupCodeDialog = ({ codes, onFinish }: BackupCodeDialogProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'))
  }

  return (
    <>
      <DialogTitle variant='h4' className='text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Códigos de Recuperação
      </DialogTitle>
      <DialogContent className='flex flex-col gap-6 pbs-0 sm:pli-16'>
        <div className='flex flex-col gap-2'>
          <Alert severity='info' icon={<i className='tabler-info-circle' />}>
            <AlertTitle>Importante!</AlertTitle>
            Salve estes códigos em um lugar seguro. Se você perder seu celular, poderá usar um destes códigos para
            entrar na sua conta. Cada código só pode ser usado uma vez.
          </Alert>
        </div>

        <Box className='grid grid-cols-2 gap-4 p-4 rounded bg-action-hover border border-divider'>
          {codes.map((code, index) => (
            <div key={index} className='flex items-center gap-2'>
              <i className='tabler-circle-filled text-[6px] text-textSecondary' />
              <Typography className='font-mono font-bold tracking-wider'>{code}</Typography>
            </div>
          ))}
        </Box>

        <div className='flex justify-center'>
          <Button startIcon={<i className='tabler-copy' />} onClick={handleCopy}>
            Copiar Todos os Códigos
          </Button>
        </div>
      </DialogContent>

      <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16'>
        {/* Adicionei um onClick assíncrono aqui */}
        <Button variant='contained' color='primary' onClick={onFinish} fullWidth>
          Entendi, finalizei o backup
        </Button>
      </DialogActions>
    </>
  )
}

// --- 4. COMPONENTE PRINCIPAL ---
const TwoFactorAuth = ({ open, setOpen }: TwoFactorAuthProps) => {
  const { update } = useSession()
  const router = useRouter() // <--- 2. Instanciar useRouter

  // Estados
  const initialSelectedOption = data.filter(item => item.isSelected)[data.filter(item => item.isSelected).length - 1]
    .value
  const [authType, setAuthType] = useState<string>(initialSelectedOption)
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false)

  // Estados Lógicos
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    if (showAuthDialog && authType === 'app' && backupCodes.length === 0) {
      const fetchQr = async () => {
        try {
          const res = await fetch('/api/auth/2fa/generate')
          const data = await res.json()
          if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl)
        } catch (err) {
          console.error(err)
        }
      }
      fetchQr()
    }
  }, [showAuthDialog, authType, backupCodes.length])

  // Handlers de Fechamento
  const handleClose = () => {
    setOpen(false)
    resetState()
  }

  const handleAuthDialogClose = () => {
    setShowAuthDialog(false)
    resetState()
  }

  const resetState = () => {
    setToken('')
    setBackupCodes([])
    if (authType !== 'app') setTimeout(() => setAuthType('app'), 250)
  }

  const handleOptionChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    setAuthType(typeof prop === 'string' ? prop : (prop.target as HTMLInputElement).value)
  }

  // --- LÓGICA DE VERIFICAÇÃO ---
  const handleVerify = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()

      if (res.ok) {
        setFeedback({ open: true, message: '2FA Ativado! Salve seus códigos de backup.', severity: 'success' })

        if (data.backupCodes && Array.isArray(data.backupCodes)) {
          setBackupCodes(data.backupCodes)
        }

        // Atualização Otimista
        await update({ twoFactorEnabled: true })
      } else {
        setFeedback({ open: true, message: data.message || 'Código inválido', severity: 'error' })
      }
    } catch (err) {
      setFeedback({ open: true, message: 'Erro ao verificar', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // --- 3. FINALIZAR BACKUP (AQUI ESTÁ A CORREÇÃO) ---
  const handleFinishBackup = async () => {
    // Força o NextAuth a buscar a sessão mais recente no servidor
    // Isso garante que o status 'twoFactorEnabled: true' seja baixado
    await update()

    // Força o Next.js a atualizar os componentes da página
    router.refresh()

    // Fecha os modais
    setOpen(false)
    setShowAuthDialog(false)
    resetState()
  }

  return (
    <>
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

      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          Selecione o método de autenticação
        </DialogTitle>
        <DialogContent className='pbs-0 sm:pli-16'>
          <Grid container spacing={6}>
            {data.map((item, index) => (
              <CustomInputHorizontal
                type='radio'
                key={index}
                selected={authType}
                handleChange={handleOptionChange}
                data={item}
                gridProps={{ size: { xs: 12 } }}
                name='auth-method'
              />
            ))}
          </Grid>
        </DialogContent>
        <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16 flex justify-center'>
          <Button
            variant='contained'
            onClick={() => {
              setOpen(false)
              setShowAuthDialog(true)
            }}
          >
            Continuar
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={showAuthDialog}
        onClose={handleAuthDialogClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleAuthDialogClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
        <form onSubmit={e => e.preventDefault()}>
          {backupCodes.length > 0 ? (
            <BackupCodeDialog codes={backupCodes} onFinish={handleFinishBackup} />
          ) : authType === 'E-MAIL' ? (
            EMAILDialog(handleAuthDialogClose)
          ) : (
            <AppDialog
              handleClose={handleAuthDialogClose}
              qrCodeUrl={qrCodeUrl}
              token={token}
              setToken={setToken}
              onVerify={handleVerify}
              loading={loading}
            />
          )}
        </form>
      </Dialog>
    </>
  )
}

export default TwoFactorAuth
