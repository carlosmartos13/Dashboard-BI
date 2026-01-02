'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import { 
  Dialog, DialogContent, DialogTitle, Typography, 
  Button, Box, Alert, CircularProgress 
} from '@mui/material'
import Grid from '@mui/material/Grid' // Verifique se é Grid v2 ou v1 no seu projeto
import { toast } from 'react-toastify' // ou 'react-toastify'

import DialogCloseButton from '../DialogCloseButton'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  empresaId: number
}

const ContaAzulConfig = ({ open, setOpen, empresaId }: Props) => {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const API_BASE = '/api/integracoes/api-contaAzul'

  // Ao abrir, verifica se já está conectado
  useEffect(() => {
    if (open && empresaId) {
      checkStatus()
    }
  }, [open, empresaId])

  const checkStatus = async () => {
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/ca-config?empresaId=${empresaId}`)
      const data = await res.json()
      
      if (res.ok && data.isConnected) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.error("Erro status CA:", error)
    } finally {
      setLoading(false)
    }
  }

  // Ação de Redirecionar
  const handleConnect = () => {
    if(!empresaId) return toast.error("Empresa não identificada")
    
    // Mostra loading rápido antes de sair
    toast.loading("Redirecionando para Conta Azul...", {autoClose: 3000})
    
    // Redireciona para nossa rota de Auth que lê o .env e manda pra CA
    window.location.href = `${API_BASE}/ca-auth?empresaId=${empresaId}`
  }

  return (
    <Dialog 
      fullWidth 
      open={open} 
      onClose={() => setOpen(false)} 
      maxWidth='sm'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      <DialogTitle variant='h4' className='text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Conectar Conta Azul
        <Typography component='div' variant="subtitle2" className='mt-2'>
          Integração oficial para sincronização de dados.
        </Typography>
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pbe-16 sm:pli-16'>
        <Grid container spacing={4}>
          
          {/* Status da Conexão */}
          <Grid size={{ xs: 12 }}>
            {loading ? (
               <Box className="flex justify-center p-4">
                 <CircularProgress size={24} />
               </Box>
            ) : isConnected ? (
              <Alert severity="success" icon={<i className='tabler-check' />}>
                <strong>Conectado!</strong> Esta empresa já possui um token de acesso válido.
              </Alert>
            ) : (
              <Alert severity="info" icon={<i className='tabler-info-circle' />}>
                Ao clicar abaixo, você será redirecionado para o site da Conta Azul para autorizar o acesso.
              </Alert>
            )}
          </Grid>

          {/* Botão de Ação */}
          <Grid size={{ xs: 12 }}>
            <Box className='flex justify-center mt-4'>
                <Button 
                    variant='contained' 
                    size='large'
                    color={isConnected ? "secondary" : "primary"} // Muda cor se já tiver conectado
                    onClick={handleConnect}
                    endIcon={<i className='tabler-external-link'/>}
                    sx={{ minWidth: '200px' }}
                >
                {isConnected ? "Reconectar / Atualizar Token" : "Conectar Agora"}
                </Button>
            </Box>
            
            {isConnected && (
                <Typography variant="caption" className="block text-center mt-2 text-gray-500">
                    Clique para renovar a permissão se estiver enfrentando problemas.
                </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default ContaAzulConfig
