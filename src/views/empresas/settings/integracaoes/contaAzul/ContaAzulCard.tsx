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
import { toast } from 'react-toastify' // Ajuste conforme sua lib de toast

// Component Imports
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import ContaAzulConfig from './contaAzulConfig' // O arquivo acima
import ContaAzulSyncButton from './ContaAzulSyncButton' // Seu botão de sync existente

type CardProps = {
  empresaId: number
}

const ContaAzulCard = ({ empresaId }: CardProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [loadingTest, setLoadingTest] = useState(false)

  const API_BASE = '/api/integracoes/api-contaAzul'

  // 1. Verifica status inicial ao carregar o card
  useEffect(() => {
    const checkStatus = async () => {
      if (!empresaId) return

      try {
        const response = await fetch(`${API_BASE}/ca-config?empresaId=${empresaId}`)
        const data = await response.json()

        if (data.isConnected) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Erro status:', error)
      }
    }

    checkStatus()
  }, [empresaId])

  // 2. Botão Verificar Conexão (Teste manual)
  const handleTestConnection = async () => {
    if (!empresaId) return toast.error('Empresa não identificada')
    setLoadingTest(true)

    try {
      const response = await fetch(`${API_BASE}/ca-config?empresaId=${empresaId}`)
      const data = await response.json()

      if (response.ok && data.isConnected) {
        setIsConnected(true)
        toast.success('Conexão ativa e operante!')
      } else {
        setIsConnected(false)
        toast.error('Não conectado ou token expirado.')
      }
    } catch (error) {
      toast.error('Erro ao comunicar com servidor.')
      setIsConnected(false)
    } finally {
      setLoadingTest(false)
    }
  }

  // Props do Botão que abre o Modal
  const ButtonPropsConfig: ButtonProps = {
    variant: 'contained',
    color: isConnected ? 'secondary' : 'primary', // Azul se não conectado, Cinza se conectado
    startIcon: <i className='tabler-plug' />, // Ícone de tomada/plug
    children: isConnected ? 'Reconectar' : 'Conectar'
  }

  return (
    <Card>
      <CardContent>
        {/* Cabeçalho do Card */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mbe: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Logo da Conta Azul (Certifique-se que o caminho da imagem existe) */}
            <img
              src='/images/logo-api/ca.jpg' 
              alt='Conta Azul'
              style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48?text=CA' }} // Fallback
            />
            <Box>
              <Typography variant='h5'>Conta Azul</Typography>
              <Typography variant='body2' color='text.secondary'>
                Integração Oficial
              </Typography>
            </Box>
          </Box>

          <Chip
            label={isConnected ? 'Conectado' : 'Desconectado'}
            color={isConnected ? 'success' : 'default'}
            variant='tonal'
            size='small'
            icon={<i className={isConnected ? 'tabler-wifi' : 'tabler-wifi-off'} />}
          />
        </Box>

        <Typography className='mbe-6'>
          Sincronize clientes, vendas e contratos financeiros automaticamente.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            {/* Box de Botões */}
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}
            >
              {/* 1. Botão Verificar (Ping) */}
              <Button
                variant='outlined'
                color='secondary'
                onClick={handleTestConnection}
                disabled={loadingTest}
                startIcon={loadingTest ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-refresh' />}
              >
                Verificar
              </Button>

               {/* 2. Botão Conectar (Abre Modal) */}
              <OpenDialogOnElementClick
                element={Button}
                elementProps={ButtonPropsConfig}
                dialog={ContaAzulConfig}
                dialogProps={{ empresaId: empresaId }}
              />

              {/* 3. Botão Sincronizar (Sua lógica de sync) */}
              {isConnected && (
                  <ContaAzulSyncButton empresaId={empresaId} isConnected={isConnected} />
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ContaAzulCard
