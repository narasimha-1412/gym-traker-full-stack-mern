import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'

export const DEFAULT_PASSWORD = 'IronLog123'

export const useUsersStore = defineStore('users', {
  state: () => ({
    name: '',
    email: '',
    password: DEFAULT_PASSWORD,
    list: [
      { id: 1, name: 'Alex Rivera', email: 'alex@rivera.com', role: 'admin', status: 'active' },
      { id: 2, name: 'Sam Lee', email: 'sam@lee.com', role: 'user', status: 'active' },
    ],
  }),

  actions: {
    findByEmail(email) {
      const key = email.trim().toLowerCase()
      return this.list.find(u => u.email.toLowerCase() === key)
    },

    async create() {
      const snack = useSnackbarStore()
      const name = this.name.trim()
      const email = this.email.trim()

      if (!name || !email) {
        snack.error('Fill in name and email')
        return
      }
      if (!email.includes('@')) {
        snack.error('Enter a valid email')
        return
      }
      if (this.list.some(u => u.email === email)) {
        snack.error('Email already exists')
        return
      }

      await useLoaderStore().wrap(() => {
        this.list.push({
          id: Date.now(),
          name,
          email,
          role: 'user',
          status: 'active',
        })
        this.name = ''
        this.email = ''
        this.password = DEFAULT_PASSWORD
        snack.success('User created')
      })
    },

    async toggleStatus(id) {
      const snack = useSnackbarStore()
      const user = this.list.find(u => u.id === id)
      if (!user || user.role === 'admin') return

      if (user.email === useAppStore().user.email) {
        snack.warning('You cannot disable your own account')
        return
      }

      await useLoaderStore().wrap(() => {
        user.status = user.status === 'active' ? 'disabled' : 'active'
        snack.success(user.status === 'active' ? 'User enabled' : 'User disabled')
      })
    },

    resetPassword() {
      const snack = useSnackbarStore()
      snack.success('Password reset successfully')
    },

    async copyEmail(email) {
      const snack = useSnackbarStore()
      try {
        await navigator.clipboard.writeText(email)
        snack.success('Email copied')
      } catch {
        snack.error('Could not copy email')
      }
    },

    async copyDefaultPassword() {
      const snack = useSnackbarStore()
      try {
        await navigator.clipboard.writeText(DEFAULT_PASSWORD)
        snack.success('Default password copied')
      } catch {
        snack.error('Could not copy password')
      }
    },
  },
})
