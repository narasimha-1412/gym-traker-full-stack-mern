import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import {
  listUsers,
  createUser,
  toggleStatus as toggleStatusRequest,
  resetPassword as resetPasswordRequest,
} from '@/networks/users.services'

export const DEFAULT_PASSWORD = 'IronLog123'

function apiMessage(err, fallback) {
  return err.response?.data?.message || fallback
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    name: '',
    email: '',
    password: DEFAULT_PASSWORD,
    list: [],
  }),

  actions: {
    async fetchList() {
      const snack = useSnackbarStore()
      await useLoaderStore().wrap(async () => {
        try {
          const { data } = await listUsers()
          this.list = data
        } catch (err) {
          snack.error(apiMessage(err, 'Could not load users'))
        }
      })
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

      await useLoaderStore().wrap(async () => {
        try {
          await createUser({
            name,
            email,
            password: this.password || DEFAULT_PASSWORD,
          })
          this.name = ''
          this.email = ''
          this.password = DEFAULT_PASSWORD
          const { data } = await listUsers()
          this.list = data
          snack.success('User created')
        } catch (err) {
          snack.error(apiMessage(err, 'Could not create user'))
        }
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

      await useLoaderStore().wrap(async () => {
        try {
          const { data } = await toggleStatusRequest(id)
          const idx = this.list.findIndex(u => u.id === id)
          if (idx !== -1) this.list[idx] = data
          snack.success(data.status === 'active' ? 'User enabled' : 'User disabled')
        } catch (err) {
          snack.error(apiMessage(err, 'Could not update user'))
        }
      })
    },

    async resetPassword(id) {
      const snack = useSnackbarStore()
      await useLoaderStore().wrap(async () => {
        try {
          await resetPasswordRequest(id)
          snack.success('Password reset successfully')
        } catch (err) {
          snack.error(apiMessage(err, 'Could not reset password'))
        }
      })
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
