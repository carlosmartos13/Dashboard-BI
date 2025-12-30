// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import Emp_Settings from '@views/empresas/settings'

const Details = dynamic(() => import('@/views/empresas/settings/dados'))
const Integracoes = dynamic(() => import('@/views/empresas/settings/integracaoes'))
const CheckoutTab = dynamic(() => import('@/views/empresas/settings/teste-api'))


// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  integracoes: <Integracoes />,
  'Dados': <Details />,
  teste: <CheckoutTab />
 
})

const eCommerceSettings = () => {
  return <Emp_Settings tabContentList={tabContentList()} />
}

export default eCommerceSettings
