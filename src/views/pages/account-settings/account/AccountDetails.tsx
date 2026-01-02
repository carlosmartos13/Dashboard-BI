'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

type Data = {
  name: string
  email: string
}

const AccountDetails = () => {
  const { data: session, update } = useSession()

  // States de Dados
  const [formData, setFormData] = useState<Data>({ name: '', email: '' })
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')

  // States de Status (UX)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Controle de Carregamento Inicial
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Ref para evitar loops e controlar auto-save inicial
  const isFirstRender = useRef(true)

  // --- 1. CARREGA DADOS DO BANCO (GET) ---
  useEffect(() => {
    const fetchUserData = async () => {
      // Se não tem email, não busca
      if (!session?.user?.email) return

      try {
        // Só ativa o loading visual se for a primeira carga ou se o formulário estiver vazio
        // Isso evita a piscada quando a sessão atualiza apenas o nome
        if (isFirstRender.current) {
          setIsLoadingData(true)
        }

        const res = await fetch('/api/user/update-profile', {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' }
        })

        if (res.ok) {
          const userData = await res.json()

          setFormData({
            name: userData.name || '',
            email: userData.email || ''
          })

          if (userData.image) {
            setImgSrc(userData.image)
          } else if (session.user.image) {
            setImgSrc(session.user.image)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        setIsLoadingData(false)
        isFirstRender.current = false
      }
    }

    fetchUserData()

    // --- O SEGREDO ESTÁ AQUI EMBAIXO ---
    // Antes estava [session]. Agora monitoramos apenas o email.
    // Se você atualizar o nome, o email não muda, então esse efeito NÃO roda de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  // --- 2. SALVAR NO BANCO (PUT) ---
  const saveToBackend = async (data: { name: string; image?: string }) => {
    setSaveStatus('saving')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error('Erro ao salvar')

      // Atualiza a sessão local (Apenas Nome)
      // Como mudamos a dependência do useEffect lá em cima,
      // chamar esse update() não vai mais recarregar a tela inteira.
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name
          }
        })
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error(error)
      setSaveStatus('error')
    }
  }

  // --- 3. AUTO-SAVE (DEBOUNCE) ---
  useEffect(() => {
    if (isLoadingData || isFirstRender.current) return

    const timer = setTimeout(() => {
      // Só salva se o nome for diferente do que está na sessão para economizar recursos
      // E garante que tem algum nome digitado
      if (formData.name && formData.name !== session?.user?.name) {
        saveToBackend({ name: formData.name })
      }
    }, 1000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name])

  // --- 4. HANDLERS ---
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
  }

  const handleFileInputChange = (file: ChangeEvent) => {
    setErrorMessage(null)
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]
      if (selectedFile.size > 800 * 1024) {
        setErrorMessage('Imagem muito grande! Máximo 800KB.')
        return
      }
      reader.onload = () => {
        const base64 = reader.result as string
        setImgSrc(base64)
        saveToBackend({ name: formData.name, image: base64 })
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // --- 5. RENDER ---
  if (isLoadingData) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center min-h-[200px]'>
          <div className='flex flex-col items-center gap-2'>
            <CircularProgress size={30} />
            <Typography variant='caption'>Carregando perfil...</Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='mbe-4 flex justify-between items-start'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded object-cover' src={imgSrc} alt='Profile' />
          <div className='flex grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Trocar Foto
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
            </div>
            <Typography variant='caption'>Somente JPG, GIF ou PNG. Máx 800K</Typography>
            {errorMessage && (
              <Typography color='error' variant='caption' className='block font-bold mt-1'>
                {errorMessage}
              </Typography>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          {saveStatus === 'saving' && (
            <Chip icon={<CircularProgress size={16} color='inherit' />} label='Salvando...' variant='outlined' />
          )}
          {saveStatus === 'saved' && (
            <Chip icon={<i className='tabler-check' />} label='Salvo' className='text-success bg-success-light' />
          )}
          {saveStatus === 'error' && (
            <Chip icon={<i className='tabler-alert-circle' />} label='Erro' className='text-error bg-error-light' />
          )}
        </div>
      </CardContent>

      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              fullWidth
              label='Nome Completo'
              value={formData.name}
              placeholder='Seu nome'
              onChange={handleNameChange}
              helperText='As alterações são salvas automaticamente.'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField fullWidth label='Email' value={formData.email} disabled />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
