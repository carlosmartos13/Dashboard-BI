'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

type Props = {
  empresaId: number
  selectedDate: Date // <--- Adicione isso
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const VendasCardsResumo = ({ empresaId, selectedDate }: Props) => {
  const [resumo, setResumo] = useState({ aReceber: 0, atrasado: 0, recebidoMes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Agora o selectedDate existe e o TS não vai reclamar
    const loadResumo = async () => {
      setLoading(true) // Importante resetar loading ao trocar data
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const res = await fetch(`/api/integracoes/api-contaAzul/vendas-resumo?empresaId=${empresaId}&date=${dateStr}`)
        const data = await res.json()
        setResumo(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadResumo()
  }, [empresaId, selectedDate])

  if (loading) return <LinearProgress sx={{ mb: 4 }} />

  const cardData = [
    {
      title: 'A Receber',
      value: formatBRL(resumo.aReceber),
      icon: 'tabler-clock-dollar',
      color: 'primary'
    },
    {
      title: 'Em Atraso',
      value: formatBRL(resumo.atrasado),
      icon: 'tabler-alert-triangle',
      color: 'error'
    },
    {
      title: 'Recebido (Mês)',
      value: formatBRL(resumo.recebidoMes),
      icon: 'tabler-circle-check',
      color: 'success'
    }
  ]

  return (
    <Grid container spacing={6} sx={{ mb: 6 }}>
      {cardData.map((item, index) => (
        <Grid size={{ xs: 12, md: 4 }} key={index}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Avatar
                variant='rounded'
                sx={{ width: 48, height: 48, backgroundColor: `${item.color}.lighter`, color: `${item.color}.main` }}
              >
                <i className={item.icon} style={{ fontSize: '1.75rem' }} />
              </Avatar>
              <Box>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {item.title}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  {item.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default VendasCardsResumo
