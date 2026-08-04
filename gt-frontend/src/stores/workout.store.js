import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useDashboardStore } from './dashboard.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'

export const useWorkoutStore = defineStore('workout', {
  state: () => ({
    draft: null,
  }),

  actions: {
    clone(obj) {
      return JSON.parse(JSON.stringify(obj))
    },

    sanitizeWeight(value) {
      const cleaned = String(value ?? '').replace(/[^\d.]/g, '')
      const [whole, ...rest] = cleaned.split('.')
      return rest.length ? `${whole}.${rest.join('')}` : whole
    },

    persist() {
      if (!this.draft) return
      const ctx = useDashboardStore().findRoutineContext(this.draft.id)
      if (ctx) ctx.split.routines[ctx.index] = this.clone(this.draft)
    },

    loadDraft(id) {
      const src = useDashboardStore().getById(id)
      this.draft = src ? this.clone(src) : null
      return !!this.draft
    },

    async toggleExercise(exId) {
      const ex = this.draft?.exercises.find(e => e.id === exId)
      if (!ex) return

      await useLoaderStore().wrap(() => {
        ex.done = !ex.done
        this.persist()
        useSnackbarStore().success(ex.done ? `"${ex.name}" marked done` : `"${ex.name}" unmarked`)
      })
    },

    async saveExercise(mode, form) {
      const snack = useSnackbarStore()
      if (!this.draft || !form?.name?.trim()) {
        snack.warning('Exercise name is required')
        return false
      }

      const weight = this.sanitizeWeight(form.weight)
      await useLoaderStore().wrap(() => {
        if (mode === 'edit') {
          const ex = this.draft.exercises.find(e => e.id === form.id)
          if (ex)
            Object.assign(ex, {
              name: form.name,
              weight,
              description: form.description || '',
            })
          snack.success('Exercise updated')
        } else {
          this.draft.exercises.push({
            id: useDashboardStore().nextId(),
            name: form.name.trim(),
            weight,
            description: form.description || '',
            done: false,
          })
          snack.success('Exercise added')
        }
        this.persist()
      })
      return true
    },

    async deleteExercise(exId) {
      if (!this.draft) return false
      const name = this.draft.exercises.find(e => e.id === exId)?.name

      const ok = await useConfirmStore().ask({
        title: 'Delete exercise?',
        message: name
          ? `"${name}" will be removed from this routine.`
          : 'This exercise will be removed from this routine.',
        confirmLabel: 'Delete',
      })
      if (!ok) return false

      await useLoaderStore().wrap(() => {
        this.draft.exercises = this.draft.exercises.filter(e => e.id !== exId)
        this.persist()
        useSnackbarStore().success(name ? `"${name}" deleted` : 'Exercise deleted')
      })
      return true
    },

    goBack() {
      this.persist()
      this.draft = null
      useAppStore().goDashboard()
    },
  },
})
