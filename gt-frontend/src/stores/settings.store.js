import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useLoginStore } from './login.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'
import { updateProfile, changePassword as changePasswordRequest } from '@/networks/auth.services'
import { getData, apiMessage } from '@/networks/base/envelope'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    profile: { name: '', email: '', weightUnit: 'kg' },
    pw: { current: '', next: '', confirm: '' },
  }),

  actions: {
    resetForm() {
      this.pw = { current: '', next: '', confirm: '' }
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
      this.resetForm()
      await useLoaderStore().wrap(() => {
        this.loadProfile()
        useAppStore().goSettings()
      })
    },

    async saveProfile() {
      const snack = useSnackbarStore()
      const app = useAppStore()
      const name = this.profile.name.trim()
      if (!name) {
        snack.warning('Username is required')
        return
      }
      if (name.length < 2) {
        snack.warning('Username must be at least 2 characters')
        return
      }

      const weightUnit = this.profile.weightUnit
      if (name === app.user.name && weightUnit === app.weightUnit) {
        snack.warning('No changes to save')
        return
      }

      await useLoaderStore().wrap(async () => {
        try {
          const data = getData(
            await updateProfile({
              name,
              weightUnit,
            })
          )
          app.updateProfile({
            name: data.user.name,
            weightUnit: data.user.weightUnit,
          })
          this.loadProfile()
          snack.success('Profile updated')
        } catch (err) {
          snack.error(apiMessage(err, 'Could not update profile'))
        }
      })
    },

    async changePassword() {
      const snack = useSnackbarStore()
      const { current, next, confirm } = this.pw

      if (!current || !next || !confirm) {
        snack.warning('Fill in all password fields')
        return
      }
      if (next !== confirm) {
        snack.error('Passwords do not match')
        return
      }
      if (next.length < 8) {
        snack.warning('Password must be at least 8 characters')
        return
      }
      if (next === current) {
        snack.warning('New password must be different')
        return
      }

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(
            await changePasswordRequest({
              currentPassword: current,
              newPassword: next,
            })
          )
          useAppStore().setAccessToken(data.accessToken)
          this.resetForm()
          snack.success('Password updated')
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not update password'))
          return false
        }
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
        useLoginStore().reset()
        await useAppStore().logout()
        useSnackbarStore().info('Logged out')
      })
    },
  },
})
