import { createTheme } from '@mui/material/styles'

export const colors = {
  bg: '#0a0c11',
  surface: '#14171f',
  surface2: '#1b1f2a',
  stroke: '#262b38',
  blue: '#3b82f6',
  red: '#ef4444',
  muted: '#8b93a6',
  text: '#e9ebf1',
  success: '#34d399',
  warning: '#f59e0b',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #7c5cf0 50%, #ef4444 100%)',
  radius: '16px',
  radiusBtn: '12px',
}

export default createTheme({
  palette: {
    mode: 'dark',
    background: { default: colors.bg, paper: colors.surface },
    primary: { main: colors.blue },
    secondary: { main: colors.red },
    success: { main: colors.success },
    error: { main: colors.red },
    warning: { main: colors.warning },
    text: { primary: colors.text, secondary: colors.muted },
    divider: colors.stroke,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    h1: { fontFamily: "'Space Grotesk', sans-serif" },
    h2: { fontFamily: "'Space Grotesk', sans-serif" },
    h3: { fontFamily: "'Space Grotesk', sans-serif" },
    h4: { fontFamily: "'Space Grotesk', sans-serif" },
    h5: { fontFamily: "'Space Grotesk', sans-serif" },
    h6: { fontFamily: "'Space Grotesk', sans-serif" },
    button: { fontFamily: "'Space Grotesk', sans-serif", textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: {
          height: '100%',
          margin: 0,
          backgroundColor: colors.bg,
          color: colors.text,
        },
        '#root': { height: '100%', minHeight: '100%' },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
})
