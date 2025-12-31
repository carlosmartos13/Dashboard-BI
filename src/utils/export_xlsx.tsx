import * as XLSX from 'xlsx'

/**
 * Gera e baixa um arquivo Excel com formatação numérica correta.
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Dados') => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar.')
    return
  }

  // 1. Cria a Planilha (Worksheet) com os dados brutos
  const worksheet = XLSX.utils.json_to_sheet(data)

  // 2. FORMATAÇÃO CONTÁBIL (O Segredo está aqui)
  // Varre todas as células da planilha
  const range = XLSX.utils.decode_range(worksheet['!ref'] || '')

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]

      // Se a célula existe e é do tipo "Number" (n)
      if (cell && cell.t === 'n') {
        // Aplica o formato contábil Brasileiro: "R$ 1.000,00"
        // O código #,##0.00 garante separador de milhar e 2 casas decimais
        cell.z = '"R$" #,##0.00'
      }
    }
  }

  // 3. Calcula largura automática das colunas
  const headers = Object.keys(data[0])
  const colWidths = headers.map(header => ({
    wch: Math.max(header.length + 5, 20)
  }))
  worksheet['!cols'] = colWidths

  // 4. Cria o Arquivo e Download
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
