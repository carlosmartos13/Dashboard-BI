// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { useState } from 'react'

// Tipagem das props que o componente vai receber
interface ProfileProps {
  formData: any
  handleChange: (field: string, value: string) => void
  setFormData: any // Para atualizar múltiplos campos de uma vez
}

const Profile = ({ formData, handleChange, setFormData }: ProfileProps) => {
  const [loadingCnpj, setLoadingCnpj] = useState(false)

  // Função para buscar CNPJ na BrasilAPI
  const handleConsultarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) {
      toast.warning('Digite um CNPJ válido (14 números) para buscar.')
      return
    }

    setLoadingCnpj(true)
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      const data = await response.json()

      if (response.ok) {
        // Atualiza vários campos de uma vez com o retorno da API
        setFormData((prev: any) => ({
          ...prev,
          name: data.razao_social,
          tradeName: data.nome_fantasia || data.razao_social,
          email: data.email,
          // Aproveita para preencher endereço se vier na API
          cep: data.cep,
          street: data.logradouro,
          number: data.numero,
          neighborhood: data.bairro,
          city: data.municipio,
          state: data.uf,
          complement: data.complemento
        }))
        toast.success('Dados da empresa encontrados!')
      } else {
        toast.error('CNPJ não encontrado.')
      }
    } catch (error) {
      toast.error('Erro ao consultar CNPJ.')
    } finally {
      setLoadingCnpj(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Perfil da Empresa' subheader='Busque pelo CNPJ para preencher automaticamente' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomTextField 
              fullWidth 
              label='CNPJ' 
              placeholder='00.000.000/0000-00' 
              value={formData.cnpj}
              onChange={e => handleChange('cnpj', e.target.value)}
              onBlur={handleConsultarCNPJ} // Busca ao sair do campo
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {loadingCnpj ? <CircularProgress size={20} /> : (
                      <IconButton onClick={handleConsultarCNPJ} edge='end'>
                        <i className='tabler-search' />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomTextField 
              fullWidth 
              label='Razão Social' 
              placeholder='Razão Social LTDA' 
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomTextField 
              fullWidth 
              label='Nome Fantasia' 
              placeholder='Nome Comercial' 
              value={formData.tradeName}
              onChange={e => handleChange('tradeName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomTextField 
              fullWidth 
              label='Email de Contato' 
              placeholder='contato@empresa.com' 
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Profile
