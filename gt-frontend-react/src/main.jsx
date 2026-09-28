import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { store } from '@/app/store'
import theme from '@/app/theme'
import AppRoutes from '@/app/router'
import { bootstrap } from '@/features/auth/authSlice'
import AppSnackbar from '@/features/ui/AppSnackbar'
import AppLoader from '@/features/ui/AppLoader'
import AppConfirm from '@/features/ui/AppConfirm'

await store.dispatch(bootstrap())

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
        <AppSnackbar />
        <AppLoader />
        <AppConfirm />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
)
