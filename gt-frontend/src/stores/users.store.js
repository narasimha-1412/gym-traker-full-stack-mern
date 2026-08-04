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
import { getData, apiMessage } from '@/networks/base/envelope'

export const DEFAULT_PASSWORD = 'IronLog123'
export const EMAIL_DOMAIN = 'ironlog.com'

const SEARCH_DEBOUNCE_MS = 300

let searchTimer = null

export function nameToEmailLocal(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''

  return parts
    .map((part, i) => {
      const lower = part.toLowerCase()
      if (i === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

export function emailFromName(name) {
  const local = nameToEmailLocal(name)
  return local ? `${local}@${EMAIL_DOMAIN}` : ''
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    name: '',
    password: DEFAULT_PASSWORD,
    list: [],
    search: '',
    searching: false,
  }),

  actions: {
    getGeneratedEmail() {
      return emailFromName(this.name)
    },

    setSearch(value) {
      this.search = value ?? ''
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        this.fetchList({ quiet: true })
      }, SEARCH_DEBOUNCE_MS)
    },

    clearSearch() {
      this.search = ''
      clearTimeout(searchTimer)
      this.fetchList({ quiet: true })
    },

    async fetchList({ quiet = false } = {}) {
      const snack = useSnackbarStore()
      const run = async () => {
        this.searching = true
        try {
          const data = getData(await listUsers({ search: this.search }))
          this.list = data.users
        } catch (err) {
          snack.error(apiMessage(err, 'Could not load users'))
        } finally {
          this.searching = false
        }
      }

      if (quiet) await run()
      else await useLoaderStore().wrap(run)
    },

    async create() {
      const snack = useSnackbarStore()
      const name = this.name.trim()
      const email = this.getGeneratedEmail()

      if (!name) {
        snack.error('Enter a name')
        return
      }
      if (!email) {
        snack.error('Could not generate email from name')
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
          this.password = DEFAULT_PASSWORD
          await this.fetchList({ quiet: true })
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
          const data = getData(await toggleStatusRequest(id))
          const idx = this.list.findIndex(u => u.id === id)
          if (idx !== -1) this.list[idx] = data.user
          snack.success(data.user.status === 'active' ? 'User enabled' : 'User disabled')
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

    async copyGeneratedEmail() {
      const snack = useSnackbarStore()
      const email = this.getGeneratedEmail()
      if (!email) {
        snack.error('Enter a name first')
        return
      }
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
