// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import Pdvlegal from './pdvlegalConfig/pdvlegal'
import ContaAzulCard from './contaAzul/ContaAzulCard'

const IntegracoesCads = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 6 }}>
        <Pdvlegal />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <ContaAzulCard empresaId={1} />
      </Grid>
    </Grid>
  )
}

export default IntegracoesCads
