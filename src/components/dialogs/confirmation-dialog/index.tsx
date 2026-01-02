'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

type ConfirmationType = 'delete-account' | 'unsubscribe' | 'suspend-account' | 'delete-order' | 'delete-customer'

type ConfirmationDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  type: ConfirmationType
}

const ConfirmationDialog = ({ open, setOpen, type }: ConfirmationDialogProps) => {
  // States
  const [secondDialog, setSecondDialog] = useState(false)
  const [userInput, setUserInput] = useState(false)

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setOpen(false)
  }

  const handleConfirmation = (value: boolean) => {
    setUserInput(value)
    setSecondDialog(true)
    setOpen(false)
  }

  return (
    <>
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-warning' />
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-2'
            })}
          >
            <Typography variant='h4'>
              {type === 'delete-account' && 'Tem certeza de que deseja desativar sua conta?'}
              {type === 'unsubscribe' && 'Tem certeza de que deseja cancelar sua assinatura?'}
              {type === 'suspend-account' && 'Tem certeza?'}
              {type === 'delete-order' && 'Tem certeza?'}
              {type === 'delete-customer' && 'Tem certeza?'}
            </Typography>
            {type === 'suspend-account' && (
              <Typography color='text.primary'>Você não poderá reverter o usuário!</Typography>
            )}
            {type === 'delete-order' && <Typography color='text.primary'>Você não poderá reverter a ordem!</Typography>}
            {type === 'delete-customer' && (
              <Typography color='text.primary'>Você não poderá reverter o cliente!</Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)}>
            {type === 'suspend-account'
              ? 'Sim, suspender usuário!'
              : type === 'delete-order'
                ? 'Sim, Excluir Ordem!'
                : type === 'delete-customer'
                  ? 'Sim, Excluir Cliente!'
                  : 'Sim'}
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              handleConfirmation(false)
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={secondDialog} onClose={handleSecondDialogClose} closeAfterTransition={false}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i
            className={classnames('text-[88px] mbe-6', {
              'tabler-circle-check': userInput,
              'text-success': userInput,
              'tabler-circle-x': !userInput,
              'text-error': !userInput
            })}
          />
          <Typography variant='h4' className='mbe-2'>
            {userInput
              ? `${type === 'delete-account' ? 'Deactivated' : type === 'unsubscribe' ? 'Unsubscribed' : type === 'delete-order' || 'delete-customer' ? 'Deleted' : 'Suspended!'}`
              : 'Cancelled'}
          </Typography>
          <Typography color='text.primary'>
            {userInput ? (
              <>
                {type === 'delete-account' && 'Sua conta foi desativada com sucesso.'}
                {type === 'unsubscribe' && 'Sua assinatura foi cancelada com sucesso.'}
                {type === 'suspend-account' && 'O usuário foi suspenso.'}
                {type === 'delete-order' && 'Sua ordem foi excluída com sucesso.'}
                {type === 'delete-customer' && 'Seu cliente foi removido com sucesso.'}
              </>
            ) : (
              <>
                {type === 'delete-account' && 'Desativação de conta cancelada!'}
                {type === 'unsubscribe' && 'Cancelamento de assinatura cancelado!'}
                {type === 'suspend-account' && 'Suspensão cancelada :)'}
                {type === 'delete-order' && 'Exclusão de ordem cancelada'}
                {type === 'delete-customer' && 'Exclusão de cliente cancelada'}
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmationDialog
