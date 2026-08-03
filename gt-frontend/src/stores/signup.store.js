import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'

export const useSignupStore = defineStore('signup', {
  state: () => ({
    username: '',
    email: '',
    password: '',
    showPassword: false,
    benefits: [
      {
        icon: 'mdi-calendar-check',
        title: 'Workout progress',
        text: 'See routines completed at a glance and stay on track.',
      },
      {
        icon: 'mdi-dumbbell',
        title: 'Workout logging',
        text: 'Save exercises, weights, and notes for every session.',
      },
      {
        icon: 'mdi-trending-up',
        title: 'Build consistency',
        text: 'Mark work done and keep momentum without clutter.',
      },
    ],
  }),

  actions: {
    toggleShowPassword() {
      this.showPassword = !this.showPassword
    },

    goLogin() {
      useAppStore().goLogin()
    },

    async submit() {
      const snack = useSnackbarStore()
      const name = this.username.trim()
      const mail = this.email.trim()
      const pass = this.password

      if (!name || !mail || !pass) {
        snack.error('Fill in username, email, and password')
        return
      }
      if (name.length < 2) {
        snack.warning('Username must be at least 2 characters')
        return
      }
      if (!mail.includes('@')) {
        snack.error('Enter a valid email address')
        return
      }
      if (pass.length < 6) {
        snack.warning('Password must be at least 6 characters')
        return
      }

      await useLoaderStore().wrap(() => {
        const app = useAppStore()
        app.loginSession({ name, email: mail })
        app.goDashboard()
        snack.success(`Welcome to IronLog, ${name}`)
        this.reset()
      })
    },

    reset() {
      this.username = ''
      this.email = ''
      this.password = ''
      this.showPassword = false
    },
  },
})
