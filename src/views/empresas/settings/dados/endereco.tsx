// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface BillingProps {
  formData: any
  handleChange: (field: string, value: string) => void
  setFormData: any
}

const BillingInformation = ({ formData, handleChange, setFormData }: BillingProps) => {
  const [loadingCep, setLoadingCep] = useState(false)

  const handleConsultarCEP = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`)
      const data = await response.json()
      
      if (response.ok) {
        setFormData((prev: any) => ({
          ...prev,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          country: 'Brasil'
        }))
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Endereço completo' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 2 }}>
            <CustomTextField 
              fullWidth 
              label='CEP' 
              placeholder='00000-000' 
              value={formData.cep}
              onChange={e => handleChange('cep', e.target.value)}
              onBlur={handleConsultarCEP}
              InputProps={{
                endAdornment: loadingCep ? <InputAdornment position='end'><CircularProgress size={20} /></InputAdornment> : null
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomTextField fullWidth label='Logradouro' value={formData.street} onChange={e => handleChange('street', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <CustomTextField fullWidth label='Número' value={formData.number} onChange={e => handleChange('number', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <CustomTextField fullWidth label='Complemento' value={formData.complement} onChange={e => handleChange('complement', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomTextField fullWidth label='Bairro' value={formData.neighborhood} onChange={e => handleChange('neighborhood', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomTextField fullWidth label='Cidade' value={formData.city} onChange={e => handleChange('city', e.target.value)} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 1 }}>
            <CustomTextField fullWidth label='UF' value={formData.state} onChange={e => handleChange('state', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 3}}>
            <CustomTextField
              select
              fullWidth
              label='País'
              value={formData.country}
              onChange={e => handleChange('country', e.target.value)}
            >
              <MenuItem value=''>Selecione</MenuItem>
              <MenuItem value='Brasil'>Brasil</MenuItem>
              <MenuItem value='Outro'>Outro</MenuItem>
            </CustomTextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default BillingInformation
