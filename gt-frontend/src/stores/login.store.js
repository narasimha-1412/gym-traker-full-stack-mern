import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { login } from '@/networks/auth.services'
import { getData, apiMessage } from '@/networks/base/envelope'

export const useLoginStore = defineStore('login', {
  state: () => ({
    email: '',
    password: '',
  }),

  actions: {
    async submit() {
      const snack = useSnackbarStore()
      const email = this.email.trim()
      if (!email || !this.password.trim()) {
        snack.error('Enter a valid email and password')
        return
      }
      if (!email.includes('@')) {
        snack.error('Invalid login details')
        return
      }

      await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await login(email, this.password))
          const app = useAppStore()
          app.loginSession(data.user, data.accessToken)
          app.goDashboard()
          snack.success('Welcome back')
        } catch (err) {
          snack.error(apiMessage(err, 'Invalid login details'))
        }
      })
    },

    reset() {
      this.email = ''
      this.password = ''
    },
  },
})
