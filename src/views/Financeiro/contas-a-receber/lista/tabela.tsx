'use client'

import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// Utils
import classnames from 'classnames'
import tableStyles from '@core/styles/table.module.css'

// --- NOSSOS NOVOS IMPORTS ---
import { getColumns } from './configtabela'
import { exportToExcel } from '@/utils/export_xlsx' // Ajuste o caminho conforme sua pasta
import { formatCurrency, formatDate, maskDocumento } from '@/utils/formatters_export_xlsx' // Ajuste o caminho

// TanStack Table Imports
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Column,
  FilterFn,
  SortingState
} from '@tanstack/react-table'
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Pega o valor da célula
  const itemValue = row.getValue(columnId)

  // Se for nulo, não filtra
  if (itemValue == null) return false

  // Compara ignorando maiúsculas/minúsculas
  return String(itemValue).toLowerCase().includes(String(value).toLowerCase())
}

// Componente de Filtro (Mantido igual)
function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue()
  return (
    <TextField
      variant='standard'
      size='small'
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Filtrar...`}
      sx={{ mt: 1, width: '100%', '& .MuiInput-root': { fontSize: '0.875rem' } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <i className='tabler-search' style={{ fontSize: '12px', opacity: 0.5 }} />
          </InputAdornment>
        )
      }}
      onClick={e => e.stopPropagation()}
    />
  )
}

type Props = {
  empresaId: number
  selectedDate: Date
}

const VendasRelatorioTable = ({ empresaId, selectedDate }: Props) => {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const res = await fetch(
          `/api/integracoes/api-contaAzul/relatorio-vendas?empresaId=${empresaId}&date=${dateStr}`
        )
        const result = await res.json()
        setData(result.data || [])
      } catch (error) {
        console.error('Erro ao carregar relatório:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [empresaId, selectedDate])

  const columns = useMemo(() => getColumns(), [])

  const table = useReactTable<any>({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter
    },
    // Dizemos para a tabela usar o 'fuzzy' como padrão na busca global
    globalFilterFn: 'fuzzy'
  })

  // --- FUNÇÃO SIMPLIFICADA USANDO O HELPER ---
  const handleExport = () => {
    // 1. Prepara os dados
    const rows = table.getFilteredRowModel().rows

    const dataToExport = rows.map(row => {
      const original = row.original

      return {
        Cliente: original.cliente?.nome || original.client_nome,
        Documento: maskDocumento(original.cliente?.documento),
        Telefone: original.cliente?.telefone || '',
        Vencimento: formatDate(original.data_vencimento),

        // CORREÇÃO 1: Status em Português direto do Banco
        Status: original.Venda_Status || original.status,

        // CORREÇÃO 2: Passando NUMBER puro (sem R$ string)
        // Se for null ou undefined, envia 0
        'A Receber': Number(original.Venda_A_Receber || 0),
        Pago: Number(original.Venda_Pago || 0),

        Emissão: formatDate(original.Venda_dtCriacao),
        'E-mail': original.cliente?.email || ''
      }
    })

    const fileName = `Relatorio_Financeiro_${selectedDate.toISOString().split('T')[0]}`
    exportToExcel(dataToExport, fileName, 'Relatório Financeiro')
  }

  return (
    <Card>
      <CardHeader
        title='Relatório Detalhado'
        action={
          <Button
            variant='tonal'
            color='success'
            onClick={handleExport}
            startIcon={<i className='tabler-file-spreadsheet' />}
          >
            Exportar Excel
          </Button>
        }
      />

      {isLoading && <LinearProgress sx={{ width: '100%' }} />}

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ verticalAlign: 'top', minWidth: '130px' }}>
                    {header.isPlaceholder ? null : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <div
                          className={classnames({
                            'flex items-center cursor-pointer select-none': header.column.getCanSort()
                          })}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-primary' />,
                            desc: <i className='tabler-chevron-down text-primary' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                        {header.column.getCanFilter() && <Filter column={header.column} />}
                      </Box>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className='text-center py-10'>
                  {isLoading ? 'Carregando...' : 'Nenhum registro encontrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        component='div'
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        rowsPerPage={table.getState().pagination.pageSize}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        labelRowsPerPage='Linhas:'
      />
    </Card>
  )
}

export default VendasRelatorioTable
