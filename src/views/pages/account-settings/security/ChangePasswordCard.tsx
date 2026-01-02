'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar' // <--- Para o Toast
import Alert from '@mui/material/Alert' // <--- Para o estilo do Toast

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

type PasswordData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Security = () => {
  // Hooks
  const { data: session } = useSession()

  // States de Dados
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // States de Visibilidade
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  // States de Status (UX)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Erros de validação (Inline)

  // State do Toast (Snackbar)
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // --- VALIDAÇÃO DE COMPLEXIDADE (Regex) ---
  const validatePasswordRules = (password: string): string | null => {
    if (password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
    if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.'
    if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.'
    if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.'
    return null // Sem erros
  }

  // --- FUNÇÃO DE SALVAR (API) ---
  const savePasswordToBackend = async () => {
    setSaveStatus('saving')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      })

      const data = await res.json()

      if (!res.ok) {
        // Se for erro do servidor (ex: Senha Atual Incorreta), lançamos erro para cair no catch
        throw new Error(data.message || 'Erro ao alterar senha')
      }

      setSaveStatus('saved')

      // Toast de Sucesso
      setToast({ open: true, message: 'Senha alterada com sucesso!', severity: 'success' })

      // Limpa os campos
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error: any) {
      console.error(error)
      setSaveStatus('error')
      // Toast de Erro (Ex: Senha atual inválida)
      setToast({ open: true, message: error.message, severity: 'error' })
    }
  }

  // --- AUTO-SAVE INTELIGENTE ---
  useEffect(() => {
    const { currentPassword, newPassword, confirmPassword } = passwordData

    // Limpa erros visuais se o usuário estiver apagando tudo
    if (!currentPassword && !newPassword && !confirmPassword) {
      setErrorMessage(null)
      setSaveStatus('idle')
      return
    }

    // 1. Só valida se os 3 campos estiverem preenchidos
    if (!currentPassword || !newPassword || !confirmPassword) return

    // 2. Valida se Nova Senha == Confirmação
    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      setSaveStatus('error') // Mostra status visual de erro
      return
    }

    // 3. Valida Complexidade (Maiúscula, Minúscula, Número)
    const complexityError = validatePasswordRules(newPassword)
    if (complexityError) {
      setErrorMessage(complexityError)
      setSaveStatus('error')
      return
    }

    // Se passou por todas as validações locais, limpa erros e prepara envio
    setErrorMessage(null)

    const timer = setTimeout(() => {
      savePasswordToBackend()
    }, 1500)

    return () => clearTimeout(timer)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordData])

  // --- HANDLERS ---
  const handleChange = (field: keyof PasswordData) => (e: ChangeEvent<HTMLInputElement>) => {
    // Limpa o status de "Salvo" assim que o usuário digita algo novo
    if (saveStatus === 'saved') setSaveStatus('idle')
    setPasswordData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleClickShowPassword = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setIsCurrentPasswordShown(show => !show)
    if (field === 'new') setIsNewPasswordShown(show => !show)
    if (field === 'confirm') setIsConfirmPasswordShown(show => !show)
  }

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }))
  }

  return (
    <Card>
      {/* --- TOAST (SNACKBAR) --- */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Posição do Toast
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant='filled'>
          {toast.message}
        </Alert>
      </Snackbar>

      <CardContent className='mbe-4 flex justify-between items-center'>
        <div className='flex flex-col gap-1'>
          <Typography variant='h5'>Alterar Senha</Typography>
          <Typography variant='body2' color='text.secondary'>
            Preencha todos os campos corretamente para salvar.
          </Typography>
          {/* Erro Inline para validações locais (regras) */}
          {errorMessage && (
            <Typography color='error' variant='caption' className='font-bold mt-1 flex items-center gap-1'>
              <i className='tabler-alert-circle text-xs' /> {errorMessage}
            </Typography>
          )}
        </div>

        {/* INDICADOR VISUAL DE STATUS */}
        <div>
          {saveStatus === 'saving' && (
            <Chip icon={<CircularProgress size={16} color='inherit' />} label='Validando...' variant='outlined' />
          )}
          {saveStatus === 'saved' && (
            <Chip
              icon={<i className='tabler-check' />}
              label='Senha Alterada!'
              className='text-success bg-success-light'
            />
          )}
          {/* Se o erro for local (validação), mostramos um Chip diferente ou nada, já que o texto vermelho avisa */}
          {saveStatus === 'error' && !errorMessage && (
            <Chip icon={<i className='tabler-x' />} label='Falha ao salvar' className='text-error bg-error-light' />
          )}
        </div>
      </CardContent>

      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={6}>
            {/* SENHA ATUAL */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Senha Atual'
                placeholder='············'
                type={isCurrentPasswordShown ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handleChange('currentPassword')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => handleClickShowPassword('current')}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isCurrentPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            {/* NOVA SENHA */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nova Senha'
                placeholder='············'
                type={isNewPasswordShown ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handleChange('newPassword')}
                // Exibe as regras no helper text para orientar o usuário
                helperText='Mín. 8 caracteres, maiúscula, minúscula e número.'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => handleClickShowPassword('new')}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isNewPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            {/* CONFIRMAR SENHA */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Confirmar Nova Senha'
                placeholder='············'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => handleClickShowPassword('confirm')}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default Security
