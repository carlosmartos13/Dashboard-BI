'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const Emp_Settings = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState('integracoes')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant='h5' className='mbe-4'>
            Configurações da Empresa
          </Typography>
          <CustomTabList orientation='vertical' onChange={handleChange} className='is-full' pill='true'>
            <Tab
              label='Integrações'
              icon={<i className='tabler-apps' />}
              iconPosition='start'
              value='integracoes'
              className='flex-row justify-start !min-is-full'
            />
            <Tab
              label='Dados da Empresa'
              icon={<i className='tabler-building-store' />}
              iconPosition='start'
              value='Dados'
              className='flex-row justify-start !min-is-full'
            />
            
            <Tab
              label='Testes de api'
              icon={<i className='tabler-checkbox' />}
              iconPosition='start'
              value='teste'
              className='flex-row justify-start !min-is-full'
            />
            
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <TabPanel value={activeTab} className='p-0'>
                {tabContentList[activeTab]}
              </TabPanel>
            </Grid>
            
          </Grid>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default Emp_Settings
