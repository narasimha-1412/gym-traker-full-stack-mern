import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    snackbar: { open: false, message: '', type: 'info', timeout: 3200, key: 0 },
    loaderPending: 0,
    confirm: {
      open: false,
      title: '',
      message: '',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true,
    },
  },
  reducers: {
    snackbarShown: (s, { payload: { message, type = 'info', timeout = 3200 } }) => {
      s.snackbar = { open: true, message, type, timeout, key: s.snackbar.key + 1 }
    },
    snackbarClosed: s => {
      s.snackbar.open = false
    },
    loaderShown: s => {
      s.loaderPending += 1
    },
    loaderHidden: s => {
      s.loaderPending = Math.max(0, s.loaderPending - 1)
    },
    confirmOpened: (s, { payload }) => {
      s.confirm = { ...s.confirm, ...payload, open: true }
    },
    confirmClosed: s => {
      s.confirm.open = false
    },
  },
})

export const {
  snackbarShown,
  snackbarClosed,
  loaderShown,
  loaderHidden,
  confirmOpened,
  confirmClosed,
} = uiSlice.actions

export const snack = {
  success: m => snackbarShown({ message: m, type: 'success' }),
  error: m => snackbarShown({ message: m, type: 'error' }),
  warning: m => snackbarShown({ message: m, type: 'warning' }),
  info: m => snackbarShown({ message: m, type: 'info' }),
}

export const selectLoaderActive = s => s.ui.loaderPending > 0
export const selectSnackbar = s => s.ui.snackbar
export const selectConfirm = s => s.ui.confirm

export default uiSlice.reducer
