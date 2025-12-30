'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// Third-party Imports
import { toast } from 'react-toastify'

// Component Imports
import DialogCloseButton from './DialogCloseButton'

type PaymentProvidersProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const PdvlegalConfig = ({ open, setOpen }: PaymentProvidersProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    client_id: '',
    client_secret: ''
  })
  const [loading, setLoading] = useState(false)

  // --- NOVO: Carregar dados ao abrir o modal ---
  useEffect(() => {
    if (open) {
      const fetchConfig = async () => {
        try {
          const res = await fetch('/api/pdv-config')
          const data = await res.json()
          
          if (res.ok && !data.empty) {
            setFormData({
              username: data.username || '',
              password: data.password || '',
              client_id: data.client_id || '',
              client_secret: data.client_secret || ''
            })
          }
        } catch (error) {
          console.error("Erro ao carregar configurações", error)
        }
      }
      fetchConfig()
    }
  }, [open]) 
  // ---------------------------------------------

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleConnect = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pdv-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setOpen(false)
        toast.success('Credenciais salvas e atualizadas!', { position: "top-right", autoClose: 3000 })
      } else {
        toast.error(data.message || 'Erro ao salvar.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Falha de comunicação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => setOpen(false)}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Configurações PDVLEGAL
        <Typography component='span' className='text-center'>
          Insira as credenciais da API para autenticação
        </Typography>
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pbe-16 sm:pli-16'>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label='Username' value={formData.username} onChange={e => handleInputChange('username', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth type='password' label='Password' value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label='Client ID' value={formData.client_id} onChange={e => handleInputChange('client_id', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth type='password' label='Client Secret' value={formData.client_secret} onChange={e => handleInputChange('client_secret', e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box className='flex gap-4 justify-center mbs-4'>
                <Button variant='contained' onClick={handleConnect} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
                <Button variant='tonal' color='secondary' onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PdvlegalConfig
