import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useUsersStore, DEFAULT_PASSWORD } from './users.store'

export const useLoginStore = defineStore('login', {
  state: () => ({
    email: '',
    password: '',
    showPassword: false,
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

      const matched = useUsersStore().findByEmail(email)
      if (!matched) {
        snack.error('Invalid login details')
        return
      }
      if (matched.status === 'disabled') {
        snack.error('Account disabled')
        return
      }
      if (this.password !== DEFAULT_PASSWORD) {
        snack.error('Invalid login details')
        return
      }

      await useLoaderStore().wrap(() => {
        const app = useAppStore()
        app.loginSession({
          name: matched.name,
          email: matched.email,
          role: matched.role,
        })
        app.goDashboard()
        snack.success('Welcome back')
      })
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
