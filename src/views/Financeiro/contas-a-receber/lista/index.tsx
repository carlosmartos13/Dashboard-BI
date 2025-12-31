'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import VendasRelatorioTable from './tabela' // (Seu VendasRelatorioTable.tsx)
import VendasCardsResumo from './VendasCardsResumo'
import VendasFilterCard from './VendasFilterCard' // <--- Novo Import
import type { UsersType } from '@/types/apps/userTypes'

const Financeirolista = ({ userData }: { userData?: UsersType[] }) => {
  // Estado Global da Data (Começa hoje)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <Grid container spacing={12}>
      {/* LINHA 1: Cards de Resumo + Filtro */}
      <Grid size={{ xs: 6, md: 6 }}>
        {/* Passamos a data para os cards saberem o que calcular */}
        <VendasCardsResumo empresaId={1} selectedDate={selectedDate} />
      </Grid>

      <Grid size={{ xs: 6, md: 5 }}>
        {/* O Filtro controla a data */}
        <VendasFilterCard date={selectedDate} setDate={setSelectedDate} />
      </Grid>

      {/* LINHA 2: Tabela */}
      <Grid size={{ xs: 12, md: 12 }}>
        {/* A tabela também reage à data */}
        <VendasRelatorioTable empresaId={1} selectedDate={selectedDate} />
      </Grid>
    </Grid>
  )
}

export default Financeirolista
