'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// --- FUNÇÕES DE MÁSCARA (FORMATAÇÃO VISUAL) ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  })
}

// Formata CPF (11) ou CNPJ (14)
const maskDocumento = (doc: string | null | undefined) => {
  if (!doc) return '---'
  const v = doc.replace(/\D/g, '') // Remove tudo que não é dígito

  if (v.length === 11) {
    // CPF
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (v.length === 14) {
    // CNPJ
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return doc // Se não bater o tamanho, retorna o original
}

// Formata Celular (11) ou Fixo (10)
const maskPhone = (phone: string | null | undefined) => {
  if (!phone) return '---'
  let v = phone.replace(/\D/g, '') // Remove não dígitos

  // Remove código do país (55) se vier junto e ficar muito longo
  if (v.length > 11 && v.startsWith('55')) {
    v = v.substring(2)
  }

  if (v.length === 11) {
    // Celular (XX) XXXXX-XXXX
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (v.length === 10) {
    // Fixo (XX) XXXX-XXXX
    return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// --- FIM DAS FUNÇÕES ---

const statusObj: any = {
  RECEBIDO: { title: 'Pago', color: 'success' },
  ACQUITTED: { title: 'Pago', color: 'success' },
  EM_ABERTO: { title: 'Pendente', color: 'warning' },
  PENDING: { title: 'Pendente', color: 'warning' },
  OVERDUE: { title: 'Atrasado', color: 'error' },
  ATRASADO: { title: 'Atrasado', color: 'error' },
  RECEBIDO_PARCIAL: { title: 'Parcial', color: 'info' },
  PARTIAL: { title: 'Parcial', color: 'info' }
}

const columnHelper = createColumnHelper<any>()

export const getColumns = () => [
  columnHelper.accessor('cliente.nome', {
    header: 'Cliente',
    cell: ({ row }) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
          {row.original.client_nome || row.original.cliente?.nome}
        </Typography>
        <Typography variant='caption'>{row.original.cliente?.email || 'Sem e-mail'}</Typography>
      </Box>
    )
  }),

  // COLUNA DOCUMENTO FORMATADA
  columnHelper.accessor('cliente.documento', {
    header: 'Documento',
    cell: ({ row }) => (
      <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
        {maskDocumento(row.original.cliente?.documento)}
      </Typography>
    )
  }),

  // COLUNA TELEFONE FORMATADA
  columnHelper.accessor('cliente.telefone', {
    header: 'Telefone',
    cell: ({ row }) => (
      <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
        {maskPhone(row.original.cliente?.telefone)}
      </Typography>
    )
  }),

  columnHelper.accessor('data_vencimento', {
    header: 'Vencimento',
    cell: ({ row }) => (
      <Typography variant='body2' sx={{ fontWeight: 600 }}>
        {formatDate(row.original.data_vencimento)}
      </Typography>
    )
  }),

  columnHelper.accessor('Venda_Status', {
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status || row.original.Venda_Status
      const config = statusObj[status] || { title: status, color: 'secondary' }

      return (
        <Chip
          label={config.title}
          color={config.color}
          variant='tonal'
          size='small'
          sx={{ textTransform: 'capitalize' }}
        />
      )
    }
  }),

  columnHelper.accessor('Venda_A_Receber', {
    header: 'A Receber',
    cell: ({ row }) => (
      <Typography variant='body2' color='error.main' sx={{ fontWeight: 500 }}>
        {formatCurrency(row.original.Venda_A_Receber)}
      </Typography>
    )
  }),

  columnHelper.accessor('Venda_Pago', {
    header: 'Pago',
    cell: ({ row }) => (
      <Typography variant='body2' color='success.main' sx={{ fontWeight: 500 }}>
        {formatCurrency(row.original.Venda_Pago)}
      </Typography>
    )
  })
]
