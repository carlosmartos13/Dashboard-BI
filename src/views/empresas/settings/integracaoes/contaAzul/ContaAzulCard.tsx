'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import type { ButtonProps } from '@mui/material/Button'

// Third-party Imports
import { toast } from 'react-toastify'

// Component Imports
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import ContaAzulConfig from './contaAzulConfig'

// IMPORTANTE: Importamos o botão novo aqui
import ContaAzulSyncButton from './ContaAzulSyncButton'

type CardProps = {
  empresaId: number
}

const ContaAzulCard = ({ empresaId }: CardProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [loadingTest, setLoadingTest] = useState(false)

  const API_BASE = '/api/integracoes/api-contaAzul'

  // 1. Verifica status inicial
  useEffect(() => {
    const checkStatus = async () => {
      if (!empresaId) return
      try {
        const response = await fetch(`${API_BASE}/ca-config?empresaId=${empresaId}`)
        const data = await response.json()
        if (data.accessToken) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Erro status:', error)
      }
    }
    checkStatus()
  }, [empresaId])

  // 2. Botão Verificar Conexão (Ping)
  const handleTestConnection = async () => {
    if (!empresaId) return toast.error('Empresa não identificada')
    setLoadingTest(true)
    try {
      const response = await fetch(`${API_BASE}/ca-config?empresaId=${empresaId}`)
      const data = await response.json()

      if (response.ok && data.accessToken) {
        setIsConnected(true)
        toast.success('Conexão verificada! Token ativo.')
      } else {
        setIsConnected(false)
        toast.warning('Token não encontrado ou expirado.')
      }
    } catch (error) {
      toast.error('Erro de comunicação.')
      setIsConnected(false)
    } finally {
      setLoadingTest(false)
    }
  }

  // Props do Botão de Configuração
  const ButtonPropsConfig: ButtonProps = {
    variant: 'contained',
    color: 'success',
    startIcon: <i className='tabler-settings' />,
    children: 'Configurar'
  }

  return (
    <Card>
      <CardContent>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mbe: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <img
              src='/images/logo-api/ca.jpg'
              alt='Conta Azul Logo'
              style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }}
            />
            <Box>
              <Typography variant='h5'>Conta Azul</Typography>
              <Typography variant='body2' color='text.secondary'>
                Gestão Financeira
              </Typography>
            </Box>
          </Box>

          <Chip
            label={isConnected ? 'Conectado' : 'Desconectado'}
            color={isConnected ? 'success' : 'warning'}
            variant='tonal'
            size='small'
            icon={<i className={isConnected ? 'tabler-circle-check' : 'tabler-alert-circle'} />}
          />
        </Box>

        <Typography className='mbe-6'>Sincronize clientes e contratos da Conta Azul com seu ERP.</Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            {/* Box flexível para os botões */}
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-end', alignItems: 'flex-start' }}
            >
              {/* Botão Configurar (Abre Modal) */}
              <OpenDialogOnElementClick
                element={Button}
                elementProps={ButtonPropsConfig}
                dialog={ContaAzulConfig}
                dialogProps={{ empresaId: empresaId }}
              />

              {/* Botão Verificar */}
              <Button
                variant='outlined'
                color='secondary'
                startIcon={
                  loadingTest ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-activity' />
                }
                onClick={handleTestConnection}
                disabled={loadingTest}
              >
                Verificar
              </Button>

              {/* AQUI ESTÁ O NOVO BOTÃO ISOLADO */}
              <ContaAzulSyncButton empresaId={empresaId} isConnected={isConnected} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ContaAzulCard
