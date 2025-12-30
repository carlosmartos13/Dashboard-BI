// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import Pdvlegal from './pdvlegalConfig/pdvlegal'
import ContaAzul from './contaAzul/contaAzul'

const IntegracoesCads = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 6 }}>
        <Pdvlegal />
        
      </Grid>
      <Grid size={{ xs: 6 }}>
        <ContaAzul empresaId={1}/>
       </Grid>
      
      
    </Grid>
  )
}

export default IntegracoesCads
