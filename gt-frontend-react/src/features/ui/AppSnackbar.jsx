import { Snackbar, Alert, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { snackbarClosed, selectSnackbar } from './uiSlice'
import { colors } from '@/app/theme'

const ICONS = {
  success: CheckCircleOutlineIcon,
  error: ErrorOutlineIcon,
  warning: WarningAmberIcon,
  info: InfoOutlinedIcon,
}

const BORDERS = {
  success: 'rgba(52, 211, 153, 0.45)',
  error: 'rgba(239, 68, 68, 0.5)',
  warning: 'rgba(245, 158, 11, 0.5)',
  info: 'rgba(59, 130, 246, 0.45)',
}

const ICON_COLORS = {
  success: colors.success,
  error: colors.red,
  warning: colors.warning,
  info: colors.blue,
}

export default function AppSnackbar() {
  const dispatch = useAppDispatch()
  const snackbar = useAppSelector(selectSnackbar)
  const Icon = ICONS[snackbar.type] || ICONS.info

  return (
    <Snackbar
      key={snackbar.key}
      open={snackbar.open}
      autoHideDuration={snackbar.timeout}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') dispatch(snackbarClosed())
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 1.5, mr: 1.5 }}
    >
      <Alert
        severity={snackbar.type}
        icon={<Icon sx={{ color: ICON_COLORS[snackbar.type] || colors.blue }} />}
        action={
          <IconButton
            size="small"
            aria-label="Close"
            color="inherit"
            onClick={() => dispatch(snackbarClosed())}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          minWidth: 260,
          maxWidth: 'min(360px, calc(100vw - 24px))',
          bgcolor: colors.surface,
          color: colors.text,
          border: `1px solid ${BORDERS[snackbar.type] || BORDERS.info}`,
          borderRadius: colors.radiusBtn,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          alignItems: 'flex-start',
          '& .MuiAlert-message': { py: 0.25, fontSize: '0.875rem', lineHeight: 1.4 },
          '& .MuiAlert-icon': { py: 0.5 },
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  )
}
