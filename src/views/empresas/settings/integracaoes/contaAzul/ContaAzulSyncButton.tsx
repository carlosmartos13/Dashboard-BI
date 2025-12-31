'use client'

import { useState } from 'react'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'

// Importa o Modal que acabamos de criar
import CaModalSync from './caModalSync'

type Props = {
  empresaId: number
  isConnected: boolean
}

const ContaAzulSyncButton = ({ empresaId, isConnected }: Props) => {
  // Estado para controlar abertura do modal
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      <Tooltip title='Abrir painel de sincronização'>
        <span>
          <Button
            variant='contained'
            color='primary'
            onClick={() => setOpenModal(true)}
            disabled={!isConnected}
            startIcon={<i className='tabler-refresh' />}
          >
            Sincronizar...
          </Button>
        </span>
      </Tooltip>

      {/* O Modal fica aqui, mas só aparece quando open=true */}
      <CaModalSync open={openModal} onClose={() => setOpenModal(false)} empresaId={empresaId} />
    </>
  )
}

export default ContaAzulSyncButton
