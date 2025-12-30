'use client'

// React Imports
import { useState, useEffect } from 'react' // <--- Não esqueça de importar useEffect

// MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress' // Opcional: para mostrar carregando

// Component Imports
import Profile from './Profile'
import Endereco from './endereco' // Ou './endereco' conforme seu arquivo
import { toast } from 'react-toastify'

const Details = () => {
  // Estado Unificado
  const [formData, setFormData] = useState({
    cnpj: '',
    name: '',
    tradeName: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil'
  })

  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true) // Novo estado para carregamento inicial

  // --- NOVO: Carregar dados ao iniciar a página ---
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/company')
        const data = await response.json()

        if (response.ok && !data.empty) {
          // Preenche o formulário com o que veio do banco
          // Usamos || '' para garantir que null vire string vazia
          setFormData({
            cnpj: data.cnpj || '',
            name: data.name || '',
            tradeName: data.tradeName || '',
            email: data.email || '',
            cep: data.cep || '',
            street: data.street || '',
            number: data.number || '',
            complement: data.complement || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'Brasil'
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error)
        // Não precisa alertar erro aqui, se falhar o form só fica vazio
      } finally {
        setIsFetching(false) // Terminou de carregar
      }
    }

    fetchCompanyData()
  }, []) 
  // ------------------------------------------------

  // Função genérica para atualizar campos
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Função para Salvar
  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Empresa salva com sucesso!')
      } else {
        toast.error(data.message || 'Erro ao salvar.')
      }
    } catch (error) {
      toast.error('Erro de comunicação.')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscard = () => {
    if(confirm('Deseja limpar todos os campos?')) {
        setFormData({
            cnpj: '', name: '', tradeName: '', email: '',
            cep: '', street: '', number: '', complement: '',
            neighborhood: '', city: '', state: '', country: 'Brasil'
        })
    }
  }

  // Se estiver carregando os dados do banco, mostra um loading (Opcional)
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Profile 
          formData={formData} 
          handleChange={handleChange} 
          setFormData={setFormData}
        />
      </Grid>
      
      <Grid size={{ xs: 12 }}>
        <Endereco 
          formData={formData} 
          handleChange={handleChange}
          setFormData={setFormData}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <div className='flex justify-end gap-4'>
          <Button 
            variant='tonal' 
            color='secondary' 
            onClick={handleDiscard}
            disabled={loading}
          >
            Descartar
          </Button>
          <Button 
            variant='contained' 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default Details
