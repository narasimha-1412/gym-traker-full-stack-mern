import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useDashboardStore } from './dashboard.store'
import { useLoginStore } from './login.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'
import { updateProfile, changePassword as changePasswordRequest } from '@/networks/auth.services'
import { getConfig, updateConfig } from '@/networks/configs.services'
import { getData, apiMessage } from '@/networks/base/envelope'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    profile: { name: '', email: '', weightUnit: 'kg' },
    pw: { current: '', next: '', confirm: '' },
    configs: {
      maxSplits: 20,
      maxWorkoutsPerSplit: 20,
      maxExercisesPerWorkout: 20,
    },
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

    loadConfigsFromApp() {
      this.configs = useAppStore().getLimits()
    },

    async loadConfigs() {
      const app = useAppStore()
      const data = getData(await getConfig())
      app.setLimits(data.config)
      this.loadConfigsFromApp()
    },

    async enter() {
      this.resetForm()
      await useLoaderStore().wrap(async () => {
        try {
          this.loadProfile()
          await this.loadConfigs()
          useAppStore().goSettings()
        } catch (err) {
          useSnackbarStore().error(apiMessage(err, 'Could not load settings'))
        }
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

    async saveConfigs() {
      const snack = useSnackbarStore()
      const app = useAppStore()
      if (!app.isAdmin()) {
        snack.error('Only admins can update configs')
        return false
      }

      const next = {
        maxSplits: this.configs.maxSplits,
        maxWorkoutsPerSplit: this.configs.maxWorkoutsPerSplit,
        maxExercisesPerWorkout: this.configs.maxExercisesPerWorkout,
      }

      const current = app.getLimits()
      const same =
        Number(next.maxSplits) === current.maxSplits &&
        Number(next.maxWorkoutsPerSplit) === current.maxWorkoutsPerSplit &&
        Number(next.maxExercisesPerWorkout) === current.maxExercisesPerWorkout

      if (same) {
        snack.warning('No changes to save')
        return false
      }

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await updateConfig(next))
          app.setLimits(data.config)
          this.loadConfigsFromApp()
          snack.success('Configs updated')
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not update configs'))
          return false
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
        useDashboardStore().clear()
        await useAppStore().logout()
        useSnackbarStore().info('Logged out')
      })
    },
  },
})
