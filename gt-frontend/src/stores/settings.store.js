import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useDashboardStore } from './dashboard.store'
import { useLoginStore } from './login.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'
import { updateProfile, changePassword as changePasswordRequest } from '@/networks/auth.services'
import { getConfig, updateConfig } from '@/networks/configs.services'
import { bulkImportSplits } from '@/networks/splits.services'
import { getData, apiMessage } from '@/networks/base/envelope'

export const BULK_IMPORT_PROMPT = `You convert a gym training plan into JSON for GymTrakio.

OUTPUT RULES:
- Reply with ONLY valid JSON. No markdown, no commentary.
- Use EXACTLY this shape and these property names (no extras):

{
  "splits": [
    {
      "title": "string",
      "workouts": [
        {
          "title": "string",
          "exercises": [
            {
              "name": "string",
              "weight": "string",
              "weightUnit": "kg" | "lb",
              "description": "string"
            }
          ]
        }
      ]
    }
  ]
}

FIELD RULES:
- title, name: required, 1–80 characters
- weight: string only (e.g. "60" or "60.5" or ""). Never a number type.
- weightUnit: MUST be exactly "kg" or "lb". Nothing else (not "lbs", "KG", "pounds").
- description: optional notes/sets/reps as one string, max 500 chars, or ""
- Do NOT include: id, done, userId, splitId, workoutId, dates, sets[], reps as separate fields
- Do NOT invent splits/workouts/exercises that are not in the user's text
- If weight unit is unclear, use "kg"
- If weight is missing, use ""
- Empty workouts arrays are allowed
- Group days under one split when the user describes one program
- Split titles must be unique in the JSON and must not match an existing split
- Workout and exercise names may repeat
- Prefer one split object per program; put all training days under its workouts array

USER PLAN:
<<<paste your training notes here>>>`

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    profile: { name: '', email: '' },
    pw: { current: '', next: '', confirm: '' },
    configs: {
      maxSplits: 20,
      maxWorkoutsPerSplit: 20,
      maxExercisesPerWorkout: 20,
    },
    bulkJson: '',
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

      if (name === app.user.name) {
        snack.warning('No changes to save')
        return
      }

      await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await updateProfile({ name }))
          app.updateProfile({ name: data.user.name })
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
      if (next.length < 4) {
        snack.warning('Password must be at least 4 characters')
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

    async copyBulkPrompt() {
      const snack = useSnackbarStore()
      try {
        await navigator.clipboard.writeText(BULK_IMPORT_PROMPT)
        snack.success('Prompt copied')
      } catch {
        snack.error('Could not copy prompt')
      }
    },

    async submitBulkImport() {
      const snack = useSnackbarStore()
      const raw = this.bulkJson.trim()
      if (!raw) {
        snack.warning('Paste JSON first')
        return false
      }

      let body
      try {
        body = JSON.parse(raw)
      } catch {
        snack.warning('Invalid JSON')
        return false
      }

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await bulkImportSplits(body))
          const c = data.created || {}
          this.bulkJson = ''
          snack.success(
            `Added ${c.splits || 0} splits, ${c.workouts || 0} workouts, ${c.exercises || 0} exercises`
          )
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not import plan'))
          return false
        }
      })
    },
  },
})
