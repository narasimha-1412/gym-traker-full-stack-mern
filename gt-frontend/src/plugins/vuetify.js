import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  theme: {
    defaultTheme: 'gymTrakioDark',
    themes: {
      gymTrakioDark: {
        dark: true,
        colors: {
          background: '#0a0c11',
          surface: '#14171f',
          primary: '#3b82f6',
          secondary: '#ef4444',
          success: '#34d399',
          error: '#ef4444',
          'on-background': '#e9ebf1',
          'on-surface': '#e9ebf1',
        },
      },
    },
  },
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  defaults: {
    VBtn: { rounded: 'lg' },
    VTextField: { variant: 'outlined', color: 'primary', hideDetails: 'auto' },
    VCard: { rounded: 'lg' },
  },
})
