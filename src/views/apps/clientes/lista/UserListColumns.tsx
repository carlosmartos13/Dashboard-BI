import { createColumnHelper } from '@tanstack/react-table'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { LicenseRow } from './UserListTypes' // Importando do arquivo acima

const columnHelper = createColumnHelper<LicenseRow>()

export const getColumns = () => [
  // 1. Botão Expandir
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }: any) => {
      if (!row.getCanExpand()) return null
      return (
        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          size="small"
        >
          <i className={row.getIsExpanded() ? 'tabler-chevron-down' : 'tabler-chevron-right'} />
        </IconButton>
      )
    }
  },

  // 2. Coluna Código
  columnHelper.accessor('codFilial', {
    header: 'Cód. Loja / Grp',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <Typography color='text.primary' className='font-medium'>
          {row.original.codFilial}
        </Typography>
        <Typography variant='caption'>
          Grp: {row.original.codGrupo}
        </Typography>
      </div>
    )
  }),

  // 3. Coluna Nome (Com indentação)
  columnHelper.accessor('nome', {
    header: 'Empresa',
    cell: ({ row }) => {
      const isChild = row.depth > 0
      return (
        <div className='flex flex-col' style={{ marginLeft: isChild ? '20px' : '0px' }}>
          <div className="flex items-center gap-2">
            {isChild && <i className="tabler-corner-down-right text-textDisabled text-sm" />}
            <Typography color='text.primary' className='font-medium'>
              {row.original.nome}
            </Typography>
          </div>
          <Typography variant='caption'>{row.original.documento}</Typography>
        </div>
      )
    }
  }),

  // 4. Produto
  columnHelper.accessor('produto', {
    header: 'Produto',
    cell: info => (
      <Chip
        label={info.getValue() || 'N/A'}
        size='small'
        color={info.getValue() === 'GESTAO LEGAL' ? 'info' : 'default'}
        variant='tonal'
      />
    )
  }),

  // 5. Status
  columnHelper.accessor('ativo', {
    header: 'Status',
    cell: info => (
      <Chip
        label={info.getValue() ? 'Ativo' : 'Inativo'}
        color={info.getValue() ? 'success' : 'secondary'}
        size='small'
        variant='tonal'
      />
    )
  }),

  // 6. Data
  columnHelper.accessor('dataCadastroApi', {
    header: 'Cadastro',
    cell: info => new Date(info.getValue()!).toLocaleDateString('pt-BR')
  }),
]
