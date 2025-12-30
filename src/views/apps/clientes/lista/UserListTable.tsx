'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import LinearProgress from '@mui/material/LinearProgress'
import CustomTextField from '@core/components/mui/TextField' // Ajuste seu import
import tableStyles from '@core/styles/table.module.css' // Ajuste seu import
import { toast } from 'react-toastify'

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  FilterFn
} from '@tanstack/react-table'

import { LicenseRow } from './UserListTypes'
import { getColumns } from './UserListColumns'

// --- CORREÇÃO DO TYPESCRIPT PARA O ERRO FUZZY ---
// Essa função não será usada de verdade se usarmos manualFiltering,
// mas ela satisfaz a exigência do TypeScript.
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  return true 
}

const LicenseTable = () => {
  // --- STATES ---
  const [data, setData] = useState<LicenseRow[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  })

  // Hook de Debounce para não chamar a API a cada tecla
  const [debouncedFilter, setDebouncedFilter] = useState(globalFilter)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(globalFilter)
      setPagination(prev => ({ ...prev, pageIndex: 0 })) // Volta pra pag 1 ao filtrar
    }, 500)
    return () => clearTimeout(handler)
  }, [globalFilter])

  // --- TRANSFORMAÇÃO DE DADOS ---
  const transformToTableData = (apiData: any[]): LicenseRow[] => {
    return apiData.map((m) => {
      const filiaisIrmas: LicenseRow[] = (m.grupo?.filiais || []).map((f: any) => ({
        id: `filial-${f.id}`,
        codFilial: f.codFilial,
        codGrupo: m.codGrupo,
        nome: f.nome,
        documento: f.documento,
        ativo: f.ativo,
        matriz: false,
        dataCadastroApi: f.dataCadastroApi,
        produto: m.grupo?.produto,
      }))

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
        subRows: filiaisIrmas
      }
    })
  }

  // --- BUSCA (GET) COM FILTRO ---
  const fetchLicencas = async () => {
    setLoading(true)
    try {
      const page = pagination.pageIndex + 1
      // ADICIONADO: Enviamos o termo de busca para a API
      const searchParam = debouncedFilter ? `&search=${debouncedFilter}` : ''
      
      const res = await fetch(`/api/licencas?page=${page}&limit=${pagination.pageSize}${searchParam}`)
      const json = await res.json()

      if (json.data && Array.isArray(json.data)) {
        setData(transformToTableData(json.data))
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

  // Recarrega quando Paginação OU Filtro (Debounced) mudar
  useEffect(() => {
    fetchLicencas()
  }, [pagination.pageIndex, pagination.pageSize, debouncedFilter])

  // --- SYNC ---
  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/licencas/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Erro sync')
      toast.success('Sincronizado!')
      fetchLicencas()
    } catch (error) {
      toast.error('Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  // --- TABELA ---
  const columns = useMemo(() => getColumns(), [])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { pagination, globalFilter, expanded },
    
    // SERVER SIDE CONFIGURATION
    manualPagination: true, // Paginação controlada pela API
    manualFiltering: true,  // Filtro controlado pela API (IMPORTANTE)
    
    rowCount,
    getSubRows: (row) => row.subRows,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),

    // CORREÇÃO DO ERRO TS: Passamos o objeto que ele exige
    filterFns: {
      fuzzy: fuzzyFilter
    }
  })

  return (
    <Card>
      <CardHeader
        title='Licenças PDV Legal'
        action={
          <Button
            variant='contained'
            onClick={handleSync}
            disabled={syncing}
            startIcon={syncing ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-refresh' />}
          >
            {syncing ? '...' : 'Sincronizar'}
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
              <tr><td colSpan={columns.length} className='text-center p-4'>Nenhum dado</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={row.getIsExpanded() ? 'bg-actionHover' : ''}>
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
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default LicenseTable
