'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  date: Date
  setDate: (date: Date) => void
}

const VendasFilterCard = ({ date, setDate }: Props) => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ]

  const handleChangeMonth = (e: any) => {
    const newMonth = parseInt(e.target.value)
    // Cria nova data SEMPRE no dia 1 para evitar pular fevereiro (30/01 -> 30/02? Não, vira Março)
    const newDate = new Date(date.getFullYear(), newMonth, 1)
    setDate(newDate)
  }

  const handleChangeYear = (e: any) => {
    const newYear = parseInt(e.target.value)
    const newDate = new Date(newYear, date.getMonth(), 1)
    setDate(newDate)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CustomTextField select fullWidth label='Mês' value={date.getMonth()} onChange={handleChangeMonth}>
          {months.map(month => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField select fullWidth label='Ano' value={date.getFullYear()} onChange={handleChangeYear}>
          {years.map(year => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </CustomTextField>
      </CardContent>
    </Card>
  )
}

export default VendasFilterCard
