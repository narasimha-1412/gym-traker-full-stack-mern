import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useDashboardStore } from './dashboard.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'
import {
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise as deleteExerciseRequest,
} from '@/networks/exercises.services'
import { getData, apiMessage } from '@/networks/base/envelope'

export const useWorkoutStore = defineStore('workout', {
  state: () => ({
    draft: null,
  }),

  actions: {
    sanitizeWeight(value) {
      const cleaned = String(value ?? '').replace(/[^\d.]/g, '')
      const [whole, ...rest] = cleaned.split('.')
      return rest.length ? `${whole}.${rest.join('')}` : whole
    },

    async loadDraft(id) {
      const dash = useDashboardStore()

      return await useLoaderStore().wrap(async () => {
        try {
          await dash.ensureLoaded()
          const workout = await dash.findWorkout(id)
          if (!workout) {
            this.draft = null
            return false
          }

          const data = getData(await listExercises(id))
          this.draft = {
            id: workout.id,
            title: workout.title,
            done: !!workout.done,
            exercises: data.exercises || [],
          }
          return true
        } catch {
          this.draft = null
          return false
        }
      })
    },

    async toggleExercise(exId) {
      const snack = useSnackbarStore()
      const ex = this.draft?.exercises.find(e => e.id === exId)
      if (!ex) return

      await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await updateExercise(exId, { done: !ex.done }))
          Object.assign(ex, data.exercise)
          snack.success(ex.done ? `"${ex.name}" marked done` : `"${ex.name}" unmarked`)
        } catch (err) {
          snack.error(apiMessage(err, 'Could not update exercise'))
        }
      })
    },

    async saveExercise(mode, form) {
      const snack = useSnackbarStore()
      if (!this.draft || !form?.name?.trim()) {
        snack.warning('Exercise name is required')
        return false
      }

      if (mode !== 'edit') {
        const { maxExercisesPerWorkout } = useAppStore().getLimits()
        if (this.draft.exercises.length >= maxExercisesPerWorkout) {
          snack.warning(`Exercise limit reached (${maxExercisesPerWorkout})`)
          return false
        }
      }

      const weight = this.sanitizeWeight(form.weight)
      const body = {
        name: form.name.trim(),
        weight,
        weightUnit: form.weightUnit === 'lb' ? 'lb' : 'kg',
        description: form.description || '',
      }

      return await useLoaderStore().wrap(async () => {
        try {
          if (mode === 'edit') {
            const data = getData(await updateExercise(form.id, body))
            const ex = this.draft.exercises.find(e => e.id === form.id)
            if (ex) Object.assign(ex, data.exercise)
            snack.success('Exercise updated')
          } else {
            const data = getData(await createExercise(this.draft.id, body))
            this.draft.exercises.push(data.exercise)
            snack.success('Exercise added')
          }
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not save exercise'))
          return false
        }
      })
    },

    async deleteExercise(exId) {
      const snack = useSnackbarStore()
      if (!this.draft) return false
      const name = this.draft.exercises.find(e => e.id === exId)?.name

      const ok = await useConfirmStore().ask({
        title: 'Delete exercise?',
        message: name
          ? `"${name}" will be removed from this workout.`
          : 'This exercise will be removed from this workout.',
        confirmLabel: 'Delete',
      })
      if (!ok) return false

      return await useLoaderStore().wrap(async () => {
        try {
          getData(await deleteExerciseRequest(exId))
          this.draft.exercises = this.draft.exercises.filter(e => e.id !== exId)
          snack.success(name ? `"${name}" deleted` : 'Exercise deleted')
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not delete exercise'))
          return false
        }
      })
    },

    goBack() {
      this.draft = null
      useAppStore().goDashboard()
    },
  },
})
