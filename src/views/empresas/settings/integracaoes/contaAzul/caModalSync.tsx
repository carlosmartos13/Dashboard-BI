'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  IconButton
} from '@mui/material'
import { toast } from 'react-toastify'

type Props = {
  open: boolean
  onClose: () => void
  empresaId: number
}

type SyncOptions = {
  clientes: boolean
  contratos: boolean
  financeiro: boolean
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const CaModalSync = ({ open, onClose, empresaId }: Props) => {
  const [options, setOptions] = useState<SyncOptions>({ clientes: true, contratos: true, financeiro: true })
  const [isSyncing, setIsSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusLine, setStatusLine] = useState('') // Linha única de status
  const [errorDetails, setErrorDetails] = useState<string | null>(null) // Para erro copiável

  const API_BASE = '/api/integracoes/api-contaAzul'

  const handleToggle = (key: keyof SyncOptions) => {
    if (isSyncing) return
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleStartSync = async () => {
    setIsSyncing(true)
    setProgress(0)
    setErrorDetails(null)
    setStatusLine('Iniciando comunicação...')

    try {
      const activeSteps = Object.values(options).filter(Boolean).length
      if (activeSteps === 0) {
        toast.warning('Selecione pelo menos uma opção.')
        setIsSyncing(false)
        return
      }

      // --- FUNÇÃO PARA RODAR CADA ETAPA ---
      const runStep = async (endpoint: string, label: string) => {
        setStatusLine(`Conectando ao módulo de ${label}...`)
        const res = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empresaId })
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(`Erro em ${label}: ${errorData.error || 'Falha na API'}`)
        }

        const data = await res.json()
        setStatusLine(`✅ ${label} finalizado: ${data.salvos || data.total} registros.`)
        await sleep(1500) // Pausa para o usuário ler o sucesso antes de mudar
      }

      // --- EXECUÇÃO EM CADEIA ---
      if (options.clientes) {
        await runStep('sync-clientes', 'Clientes')
        setProgress(33)
        if (options.contratos || options.financeiro) await sleep(1000)
      }

      if (options.contratos) {
        await runStep('sync-contratos', 'Contratos')
        setProgress(66)
        if (options.financeiro) await sleep(1000)
      }

      if (options.financeiro) {
        // Como o financeiro é o mais longo, podemos deixar o status final para ele
        await runStep('sync-financeiro', 'Financeiro')
      }

      setProgress(100)
      setStatusLine('🎉 Sincronização concluída com sucesso!')
      toast.success('Dados atualizados!')
    } catch (error: any) {
      console.error(error)
      setStatusLine('❌ A sincronização parou devido a um erro.')
      setErrorDetails(error.message || 'Erro desconhecido durante o processo.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Dialog open={open} onClose={!isSyncing ? onClose : undefined} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h6'>Sincronização Conta Azul</Typography>
      </DialogTitle>

      <DialogContent dividers>
        {!isSyncing && !errorDetails ? (
          <List disablePadding>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <i className='tabler-users' />
              </ListItemIcon>
              <ListItemText primary='Clientes' secondary='Cadastros e contatos' />
              <Switch checked={options.clientes} onChange={() => handleToggle('clientes')} />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <i className='tabler-file-certificate' />
              </ListItemIcon>
              <ListItemText primary='Contratos' secondary='Datas e status' />
              <Switch checked={options.contratos} onChange={() => handleToggle('contratos')} />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <i className='tabler-coin' />
              </ListItemIcon>
              <ListItemText primary='Contas a Receber' secondary='Mensalidades e valores' />
              <Switch checked={options.financeiro} onChange={() => handleToggle('financeiro')} />
            </ListItem>
          </List>
        ) : (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='subtitle2' color='primary' sx={{ fontWeight: 'bold' }}>
                {statusLine}
              </Typography>
              <Typography variant='caption'>{Math.round(progress)}%</Typography>
            </Box>

            <LinearProgress variant='determinate' value={progress} sx={{ height: 8, borderRadius: 4, mb: 3 }} />

            {errorDetails && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='subtitle2' color='primary' sx={{ fontWeight: 'bold' }}>
                  Ocorreu um problema técnico:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant='filled'
                  value={errorDetails}
                  label='Detalhes do erro (copie para o suporte)'
                  InputProps={{ readOnly: true, style: { fontSize: '0.8rem', fontFamily: 'monospace' } }}
                />
                <Button
                  size='small'
                  startIcon={<i className='tabler-copy' />}
                  onClick={() => {
                    navigator.clipboard.writeText(errorDetails)
                    toast.info('Copiado!')
                  }}
                  sx={{ mt: 1 }}
                >
                  Copiar erro
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSyncing}>
          {errorDetails ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isSyncing && !errorDetails && (
          <Button onClick={handleStartSync} variant='contained' startIcon={<i className='tabler-play' />}>
            Iniciar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CaModalSync
