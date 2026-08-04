import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useLoginStore } from './login.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    tab: 'profile', // profile | password
    profile: { name: '', email: '', weightUnit: 'kg' },
    pw: { next: '', confirm: '' },
    show: { next: false, confirm: false },
  }),

  actions: {
    resetForm() {
      this.pw = { next: '', confirm: '' }
      this.show = { next: false, confirm: false }
    },

    loadProfile() {
      const app = useAppStore()
      this.profile = {
        name: app.user.name,
        email: app.user.email,
        weightUnit: app.weightUnit,
      }
    },

    async enter() {
      this.tab = 'profile'
      this.resetForm()
      await useLoaderStore().wrap(() => {
        this.loadProfile()
        useAppStore().goSettings()
      })
    },

    setTab(name) {
      this.tab = name
    },

    eye(key) {
      return this.show[key] ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
    },

    toggleShow(key) {
      this.show[key] = !this.show[key]
    },

    async saveProfile() {
      const snack = useSnackbarStore()
      const name = this.profile.name.trim()
      if (!name) {
        snack.warning('Username is required')
        return
      }
      if (name.length < 2) {
        snack.warning('Username must be at least 2 characters')
        return
      }

      await useLoaderStore().wrap(() => {
        useAppStore().updateProfile({
          name,
          weightUnit: this.profile.weightUnit,
        })
        snack.success('Profile updated')
      })
    },

    async changePassword() {
      const snack = useSnackbarStore()
      const { next, confirm } = this.pw
      if (!next || !confirm) {
        snack.warning('Fill in both password fields')
        return
      }
      if (next !== confirm) {
        snack.error('Passwords do not match')
        return
      }
      if (next.length < 6) {
        snack.warning('Password must be at least 6 characters')
        return
      }

      await useLoaderStore().wrap(() => {
        this.resetForm()
        snack.success('Password updated')
      })
    },

    async logout() {
      const ok = await useConfirmStore().ask({
        title: 'Log out?',
        message: "You'll need to sign in again to continue tracking.",
        confirmLabel: 'Log out',
      })
      if (!ok) return

      await useLoaderStore().wrap(async () => {
        this.resetForm()
        this.tab = 'profile'
        useLoginStore().reset()
        await useAppStore().logout()
        useSnackbarStore().info('Logged out')
      })
    },
  },
})
