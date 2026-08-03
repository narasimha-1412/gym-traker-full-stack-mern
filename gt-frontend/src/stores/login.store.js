import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'

export const useLoginStore = defineStore('login', {
  state: () => ({
    email: '',
    password: '',
    showPassword: false,
  }),

  actions: {
    async submit() {
      const snack = useSnackbarStore()
      if (!this.email.trim() || !this.password.trim()) {
        snack.error('Enter a valid email and password')
        return
      }
      if (!this.email.includes('@')) {
        snack.error('Invalid login details')
        return
      }

      await useLoaderStore().wrap(() => {
        const app = useAppStore()
        app.loginSession({ email: this.email.trim() })
        app.goDashboard()
        snack.success('Welcome back')
      })
    },

    goSignup() {
      useAppStore().goSignup()
    },

    goForgot() {
      useAppStore().goForgot()
    },

    toggleShowPassword() {
      this.showPassword = !this.showPassword
    },

    reset() {
      this.email = ''
      this.password = ''
      this.showPassword = false
    },
  },
})
