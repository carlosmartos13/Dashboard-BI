'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import TesteAPI from './teste'


const Checkout = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <TesteAPI />
      </Grid>
      
    </Grid>
  )
}

export default Checkout
