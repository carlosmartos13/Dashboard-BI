'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { toast } from 'react-toastify'

const ApiTestPage = () => {
  // States
  const [endpoint, setEndpoint] = useState('')
  const [integration, setIntegration] = useState('pdvlegal') // Padrão selecionado
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<number | null>(null)

  const handleFetch = async () => {
    if (!endpoint) {
      toast.warning('Por favor, digite uma rota (ex: /empresas)')
      return
    }

    setLoading(true)
    setResponse(null)
    setStatus(null)

    try {
      // Chama o nosso Proxy (Passo 1)
      const res = await fetch('/api/pdv-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endpoint: endpoint,
          integration: integration
        })
      })

      const result = await res.json()

      // O proxy sempre retorna 200 se conseguir contatar a API, 
      // mas dentro do result traz o status real da API externa
      setStatus(result.status || res.status)
      setResponse(result.data || result)

    } catch (error) {
      setResponse({ error: "Erro de comunicação com o servidor local." })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      toast.success('JSON copiado!')
    }
  }

  return (
    <Card>
      <CardHeader 
        title='Teste de Integração API' 
        subheader='Selecione a integração e a rota para testar os dados reais'
        avatar={<i className='tabler-server-2' style={{ fontSize: '1.5rem' }} />}
      />
      <CardContent className='flex flex-col gap-5'>
        
        <Box className='flex flex-col sm:flex-row gap-4'>
          {/* Seletor de Integração */}
          <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }}>
            <InputLabel>Integração</InputLabel>
            <Select
              value={integration}
              label='Integração'
              onChange={e => setIntegration(e.target.value)}
            >
              <MenuItem value='pdvlegal'>PDV Legal (TabletCloud)</MenuItem>
              {/* Futuras integrações virão aqui */}
              <MenuItem value='ifood' disabled>iFood (Em breve)</MenuItem>
            </Select>
          </FormControl>

          {/* Input da Rota */}
          <TextField 
            fullWidth 
            label='Rota GET' 
            variant='outlined' 
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder='/v1/empresas' // Exemplo de placeholder
            InputProps={{
              startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>GET</Typography>
            }}
          />

          <Button 
            variant='contained' 
            onClick={handleFetch}
            disabled={loading}
            startIcon={loading ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-send' />}
            sx={{ px: 4, minWidth: 120 }}
          >
            {loading ? '...' : 'Enviar'}
          </Button>
        </Box>

        <hr className='border-t border-gray-200 dark:border-gray-700' />

        <Box>
          <Box className='flex justify-between items-center mbe-2'>
            <Box className='flex gap-2 items-center'>
              <Typography variant='h6' color='text.primary'>
                Resultado:
              </Typography>
              {status && (
                <Chip 
                  label={`Status: ${status}`} 
                  color={status >= 200 && status < 300 ? 'success' : 'error'} 
                  size='small' 
                  variant='tonal'
                />
              )}
            </Box>
            
            {response && (
              <Button 
                size='small' 
                variant='outlined'
                startIcon={<i className='tabler-copy' />}
                onClick={copyToClipboard}
              >
                Copiar
              </Button>
            )}
          </Box>

          {/* Área de Resposta */}
          <Box
            component="pre"
            sx={{
              p: 4,
              borderRadius: 1,
              backgroundColor: 'action.hover', 
              color: 'text.primary',          
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
              fontSize: '0.80rem',
              minHeight: '250px',
              maxHeight: '500px',
              fontFamily: 'monospace'
            }}
          >
            {response 
              ? JSON.stringify(response, null, 2) 
              : '// Selecione a rota acima e clique em Enviar para ver a resposta...'}
          </Box>
        </Box>

      </CardContent>
    </Card>
  )
}

export default ApiTestPage
