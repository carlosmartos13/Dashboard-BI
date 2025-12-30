'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, DialogContent, DialogTitle, Typography, TextField, 
  Button, Grid, Box, Alert 
} from '@mui/material'
import { toast } from 'react-toastify'
import DialogCloseButton from '../DialogCloseButton'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  empresaId: string | number // Aceita string ou numero, pois o backend converte
}

const ContaAzulConfig = ({ open, setOpen, empresaId }: Props) => {
  const [formData, setFormData] = useState({ client_id: '', client_secret: '' })
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  // URL base para suas rotas
  const API_BASE = '/api/integracoes/api-contaAzul'

  // 1. Carregar configuração existente
  useEffect(() => {
    // Só busca se o modal estiver aberto E tivermos um ID de empresa
    if (open && empresaId) {
      fetchConfig()
    }
  }, [open, empresaId])

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/ca-config?empresaId=${empresaId}`)
      const data = await res.json()
      
      if (res.ok && data && !data.error) {
        setFormData({ 
          client_id: data.clientId || '', 
          client_secret: data.clientSecret || '' 
        })
        // Verifica se existe accessToken salvo no banco
        setIsConnected(!!data.accessToken)
      }
    } catch (error) {
      console.error("Erro ao buscar config:", error)
    }
  }

  const handleSaveCredentials = async () => {
    if (!formData.client_id || !formData.client_secret) {
        toast.warning("Preencha os dois campos.")
        return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/ca-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos o formData e o empresaId (o backend vai converter para Int)
        body: JSON.stringify({ ...formData, empresaId })
      })
      
      if (res.ok) {
        toast.success('Credenciais salvas! Agora clique em Autorizar.')
        fetchConfig() // Recarrega para ter certeza
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Erro ao salvar credenciais.')
      }
    } catch (error) {
      toast.error('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Iniciar Fluxo OAuth
  const handleOAuthConnect = () => {
    if(!empresaId) return toast.error("Empresa não identificada")
    
    // Redireciona o navegador
    window.location.href = `${API_BASE}/ca-auth?empresaId=${empresaId}`
  }

  return (
    <Dialog 
      fullWidth 
      open={open} 
      onClose={() => setOpen(false)} 
      maxWidth='sm'
      // sx abaixo ajuda o conteúdo a não ficar colado na borda em telas pequenas
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      <DialogTitle variant='h4' className='text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Integração Conta Azul
        <Typography component='div' variant="subtitle2" className='mt-2'>
          Insira suas chaves de API e autorize o acesso.
        </Typography>
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pbe-16 sm:pli-16'>
        {/* Usando Grid container do MUI atualizado */}
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            {isConnected ? (
              <Alert severity="success" icon={<i className='tabler-check' />}>
                Conectado e Autorizado!
              </Alert>
            ) : (
              <Alert severity="warning" icon={<i className='tabler-alert-circle' />}>
                Não conectado. Salve as chaves e clique em Autorizar.
              </Alert>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              label='Client ID' 
              placeholder='Ex: xxxxx-xxxx-xxxx-xxxx'
              value={formData.client_id} 
              onChange={e => setFormData({...formData, client_id: e.target.value})} 
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              type='password' 
              label='Client Secret' 
              placeholder='Ex: xxxxxxxxxxxxx'
              value={formData.client_secret} 
              onChange={e => setFormData({...formData, client_secret: e.target.value})} 
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box className='flex justify-between gap-4 mt-2'>
                <Button 
                    variant='contained' 
                    color="primary" 
                    onClick={handleSaveCredentials} 
                    disabled={loading}
                    startIcon={loading ? <i className='tabler-loader-2 animate-spin'/> : <i className='tabler-device-floppy'/>}
                >
                1. Salvar Credenciais
                </Button>

                <Button 
                    variant='contained' 
                    color="success" 
                    onClick={handleOAuthConnect}
                    disabled={!formData.client_id || loading}
                    endIcon={<i className='tabler-external-link'/>}
                >
                2. Autorizar
                </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default ContaAzulConfig
