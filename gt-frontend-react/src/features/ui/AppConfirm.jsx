import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectConfirm } from './uiSlice'
import { settleConfirm } from './uiThunks'
import { colors } from '@/app/theme'

export default function AppConfirm() {
  const dispatch = useAppDispatch()
  const c = useAppSelector(selectConfirm)

  return (
    <Dialog
      open={c.open}
      onClose={() => dispatch(settleConfirm(false))}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
          },
        },
      }}
    >
      <DialogTitle
        sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: colors.text }}
      >
        {c.title}
      </DialogTitle>
      {c.message ? (
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.45, color: colors.muted }}>
            {c.message}
          </Typography>
        </DialogContent>
      ) : null}
      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => dispatch(settleConfirm(false))}
          sx={{ borderColor: colors.stroke, color: colors.muted }}
        >
          {c.cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={() => dispatch(settleConfirm(true))}
          sx={{
            minWidth: 88,
            bgcolor: c.danger ? colors.red : undefined,
            background: c.danger ? colors.red : colors.gradient,
            color: '#fff',
            '&:hover': {
              bgcolor: c.danger ? colors.red : undefined,
              filter: 'brightness(1.08)',
            },
          }}
        >
          {c.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
