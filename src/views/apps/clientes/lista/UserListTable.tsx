'use client'

// React Imports
import { useEffect, useState, useMemo, Fragment } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import LinearProgress from '@mui/material/LinearProgress'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// --- TYPES UNIFICADOS ---
// Criamos um tipo único que serve tanto para Matriz quanto para Filial
type LicenseRow = {
  id: string 
  codFilial: number
  codGrupo: number
  nome: string
  documento: string
  ativo: boolean
  matriz: boolean
  dataCadastroApi: string
  
  // Campos opcionais (a Matriz tem, a filial herda ou fica sem)
  produto?: string 
  
  // Contadores (Apenas Matriz usa)
  stats?: {
    ativas: number
    inativas: number
  }

  // Onde as filiais filhas ficarão guardadas para a tabela expandir
  subRows?: LicenseRow[] 
}

const columnHelper = createColumnHelper<LicenseRow>()

const LicenseTable = () => {
  // --- STATES ---
  const [data, setData] = useState<LicenseRow[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded] = useState({}) // Controla quem está aberto
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  
  const [rowCount, setRowCount] = useState(0)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // --- TRANSFORMAÇÃO DE DADOS ---
  // Converte o formato do Backend (Matriz->Grupo->Filiais) para (Linha->SubLinhas)
  const transformToTableData = (apiData: any[]): LicenseRow[] => {
    return apiData.map((m) => {
      // 1. Prepara as sub-linhas (filiais irmãs)
      const filiaisIrmas: LicenseRow[] = (m.grupo?.filiais || []).map((f: any) => ({
        id: `filial-${f.id}`,
        codFilial: f.codFilial,
        codGrupo: m.codGrupo, // Herda do pai
        nome: f.nome,
        documento: f.documento,
        ativo: f.ativo,
        matriz: false,
        dataCadastroApi: f.dataCadastroApi,
        produto: m.grupo?.produto, // Herda produto do grupo
        // Filial não tem subRows nem stats
      }))

      // 2. Retorna a linha principal (Matriz) com as filhas dentro
      return {
        id: `matriz-${m.id}`,
        codFilial: m.codFilial,
        codGrupo: m.codGrupo,
        nome: m.nome,
        documento: m.documento,
        ativo: m.ativo,
        matriz: true,
        dataCadastroApi: m.dataCadastroApi,
        produto: m.grupo?.produto,
        stats: {
          ativas: m.grupo?.qtdLojasAtivas || 0,
          inativas: m.grupo?.qtdLojasDesativadas || 0
        },
        subRows: filiaisIrmas // Aqui está a mágica da expansão
      }
    })
  }

  // --- BUSCA DE DADOS (GET) ---
  const fetchLicencas = async (pageIndex: number, pageSize: number) => {
    setLoading(true)
    try {
      const page = pageIndex + 1
      const res = await fetch(`/api/licencas?page=${page}&limit=${pageSize}`)
      const json = await res.json()

      if (json.data && Array.isArray(json.data)) {
        // Transformamos os dados antes de salvar no estado
        const formattedData = transformToTableData(json.data)
        setData(formattedData)
        setRowCount(json.meta.total)
      } else {
        setData([])
        setRowCount(0)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicencas(pagination.pageIndex, pagination.pageSize)
  }, [pagination.pageIndex, pagination.pageSize])

  // --- SINCRONIZAÇÃO (POST) ---
  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/licencas/sync', { 
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' } 
      })
      const text = await res.text()
      let json
      try {
        json = JSON.parse(text)
      } catch (e) {
        throw new Error(`Resposta inválida: ${res.status}`)
      }
      if (!res.ok) throw new Error(json.message || 'Erro sync')

      toast.success(json.message)
      setTimeout(() => {
        fetchLicencas(pagination.pageIndex, pagination.pageSize)
      }, 500)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro')
    } finally {
      setSyncing(false)
    }
  }

  // --- DEFINIÇÃO DAS COLUNAS ---
  const columns = useMemo<ColumnDef<LicenseRow, any>[]>(
    () => [
      // 1. Botão Expandir
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          // Só mostra o botão se tiver sub-linhas (filiais)
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

      // 3. Coluna Nome (Com indentação visual para filhas)
      columnHelper.accessor('nome', {
        header: 'Empresa',
        cell: ({ row }) => {
          // Se profundidade > 0, é uma filha. Adicionamos margem.
          const isChild = row.depth > 0 
          
          return (
            <div 
              className='flex flex-col' 
              style={{ marginLeft: isChild ? '20px' : '0px' }} // Indentação visual
            >
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

      // 5. Sistema
      {
        id: 'sistema',
        header: 'Sistema',
        cell: () => <Typography>PDVLEGAL</Typography>
      },

      // 6. Status
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

      // 7. Contadores (Só aparecem na Matriz)
      {
        id: 'stats',
        header: 'Lojas (Total)',
        cell: ({ row }) => {
          // Se for filha (sub-row), não mostra contadores (ou mostra vazio)
          if (!row.original.matriz || !row.original.stats) {
            return <Typography variant="caption" color="textDisabled">-</Typography>
          }

          return (
            <div className='flex gap-2'>
              <Chip 
                  label={`Atv: ${row.original.stats.ativas} / ${row.original.stats.inativas}`} 
                  size='small' 
                  color={row.original.stats?.ativas === 0 ? 'error' : 'success'}
                  variant='outlined' 
              />
             
            </div>
          )
        }
      },

      // 8. Data
      columnHelper.accessor('dataCadastroApi', {
        header: 'Cadastro',
        cell: info => new Date(info.getValue()).toLocaleDateString('pt-BR')
      }),
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id, 
    state: { pagination, globalFilter, expanded },
    manualPagination: true,
    autoResetExpanded: false,
    rowCount,
    // AVISA A TABELA ONDE ESTÃO OS FILHOS
    getSubRows: (row) => row.subRows, 
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <Card>
      <CardHeader 
        title='Licenças PDV Legal' 
        subheader='Listagem por Matriz (Expanda para ver filiais)'
        action={
          <Button 
            variant='contained' 
            onClick={handleSync} 
            disabled={syncing}
            startIcon={syncing ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-refresh' />}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        }
      />
      {loading && <LinearProgress />}
      
      <div className='p-6 flex justify-between gap-4 flex-wrap'>
        <CustomTextField
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Buscar Matriz, CNPJ...'
          className='sm:is-[300px] is-full'
        />
        <CustomTextField
          select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className='sm:is-[100px] is-full'
        >
          <MenuItem value='10'>10</MenuItem>
          <MenuItem value='25'>25</MenuItem>
          <MenuItem value='50'>50</MenuItem>
        </CustomTextField>
      </div>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-4'>Nenhum dado encontrado</td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                // NÃO PRECISAMOS MAIS DO FRAGMENT, A TABELA JÁ RENDERIZA AS SUB-LINHAS COMO TRs NORMAIS
                <tr key={row.id} className={classnames({ 'bg-actionHover': row.getIsExpanded() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <TablePagination
        component='div'
        count={rowCount} 
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        labelRowsPerPage="Matrizes por pág:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Card>
  )
}

export default LicenseTable
