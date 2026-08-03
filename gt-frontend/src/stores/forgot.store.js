import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'

export const useForgotStore = defineStore('forgot', {
  state: () => ({
    email: '',
    sent: false,
  }),

  actions: {
    async submit() {
      const snack = useSnackbarStore()
      const mail = this.email.trim()

      if (!mail) {
        snack.error('Enter your email address')
        return
      }
      if (!mail.includes('@')) {
        snack.error('Enter a valid email address')
        return
      }

      await useLoaderStore().wrap(() => {
        this.email = mail
        this.sent = true
        snack.success('Reset link sent')
      })
    },

    async resend() {
      const snack = useSnackbarStore()
      const mail = this.email.trim()

      if (!mail || !mail.includes('@')) {
        snack.error('Enter a valid email address')
        this.sent = false
        return
      }

      await useLoaderStore().wrap(() => {
        snack.success('Reset link resent')
      })
    },

    editEmail() {
      this.sent = false
    },

    openResetLink() {
      // Mock email link until a real token is issued by the API
      useAppStore().goReset('demo-token')
    },

    goLogin() {
      this.reset()
      useAppStore().goLogin()
    },

    reset() {
      this.email = ''
      this.sent = false
    },
  },
})
