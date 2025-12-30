// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import Pdvlegal from './pdvlegal'


const Pdvlegalcard = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 6 }}>
        <Pdvlegal />
      </Grid>
      
    </Grid>
  )
}

export default Pdvlegalcard
