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
import PdvlegalConfig from './pdvlegalconfig' // Verifique se o caminho está correto

const Integracoes = () => {
  // Estado para controlar a conexão (começa falso, mas o useEffect vai verificar)
  const [isConnected, setIsConnected] = useState(false)
  const [loadingTest, setLoadingTest] = useState(false)

  // --- NOVO: Verifica o status ao carregar a página (F5) ---
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Chama o GET do arquivo route.ts que você mostrou
        const response = await fetch('/api/integracoes/api-pdvLegal/pdv-auth')
        const data = await response.json()

        // Se o backend disser que tem token (isConnected: true), atualizamos o estado
        if (data.isConnected) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Erro ao verificar status inicial:', error)
      }
    }
    
    checkStatus()
  }, []) 
  // -----------------------------------------------------------

  // Função que realiza o Teste de Comunicação (POST)
  const handleTestConnection = async () => {
    setLoadingTest(true)
    try {
      const response = await fetch('/api/integracoes/api-pdvLegal/pdv-auth', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setIsConnected(true) // Atualiza visualmente para VERDE
        toast.success('Conexão estabelecida! Token gerado e salvo.')
      } else {
        setIsConnected(false) // Volta para AMARELO se der erro
        toast.error(data.message || 'Falha na autenticação.')
      }
    } catch (error) {
      toast.error('Erro de comunicação com o servidor.')
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
    children: 'Configurações API'
  }

  return (
    <Card>
      <CardContent>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mbe: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <img 
              src='/images/logo-api/pdvlegal.jpg' 
              alt='PDVLEGAL Logo' 
              style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} 
            />
            <Box>
              <Typography variant='h5'>PDVLEGAL</Typography>
              <Typography variant='body2' color='text.secondary'>API Tabletcloud</Typography>
            </Box>
          </Box>

          {/* Chip de Status Dinâmico */}
          <Chip 
            label={isConnected ? 'Conectado' : 'Desconectado'} 
            color={isConnected ? 'success' : 'warning'} 
            variant='tonal'
            size='small'
            icon={<i className={isConnected ? 'tabler-circle-check' : 'tabler-alert-circle'} />}
          />
        </Box>

        <Typography className='mbe-6'>
          API da Tabletcloud para controles e informações dos produtos PDVLEGAL.
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
              
              {/* Botão Configurações (Abre o Modal) */}
              <OpenDialogOnElementClick 
                element={Button} 
                elementProps={ButtonPropsConfig} 
                dialog={PdvlegalConfig} 
              />
            
              {/* Botão Teste (Ação Direta) */}
              <Button 
                variant='contained'
                color='secondary'
                startIcon={loadingTest ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-brand-api' />}
                onClick={handleTestConnection}
                disabled={loadingTest}
              >
                {loadingTest ? 'Testando...' : 'Teste Comunicação'}
              </Button>

            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Integracoes
