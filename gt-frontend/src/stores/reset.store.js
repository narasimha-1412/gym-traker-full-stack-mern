import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useForgotStore } from './forgot.store'

export const useResetStore = defineStore('reset', {
  state: () => ({
    token: '',
    password: '',
    confirm: '',
    showPassword: false,
    showConfirm: false,
  }),

  actions: {
    setToken(token) {
      this.token = token || ''
    },

    toggleShowPassword() {
      this.showPassword = !this.showPassword
    },

    toggleShowConfirm() {
      this.showConfirm = !this.showConfirm
    },

    goLogin() {
      this.reset()
      useForgotStore().reset()
      useAppStore().goLogin()
    },

    async submit() {
      const snack = useSnackbarStore()
      const pass = this.password
      const confirm = this.confirm

      if (!this.token) {
        snack.error('Reset link is invalid or expired')
        return
      }
      if (!pass || !confirm) {
        snack.warning('Fill in both password fields')
        return
      }
      if (pass.length < 6) {
        snack.warning('Password must be at least 6 characters')
        return
      }
      if (pass !== confirm) {
        snack.error('Passwords do not match')
        return
      }

      await useLoaderStore().wrap(() => {
        snack.success('Password updated — sign in with your new password')
        this.reset()
        useForgotStore().reset()
        useAppStore().goLogin()
      })
    },

    reset() {
      this.token = ''
      this.password = ''
      this.confirm = ''
      this.showPassword = false
      this.showConfirm = false
    },
  },
})
