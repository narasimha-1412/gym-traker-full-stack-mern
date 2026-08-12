import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'
import {
  listSplits,
  createSplit,
  renameSplit as renameSplitRequest,
  deleteSplit as deleteSplitRequest,
  activateSplit,
} from '@/networks/splits.services'
import {
  listWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout as deleteWorkoutRequest,
  resetWorkouts,
} from '@/networks/workouts.services'
import { getData, apiMessage } from '@/networks/base/envelope'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    splits: [],
    workouts: [],
    activeSplitId: null,
    loaded: false,
  }),

  actions: {
    getActiveSplit() {
      return this.splits.find(s => s.id === this.activeSplitId) || null
    },

    getActiveWorkouts() {
      return this.workouts
    },

    getProgress() {
      const workouts = this.getActiveWorkouts()
      const done = workouts.filter(w => w.done).length
      const total = workouts.length
      return {
        done,
        total,
        percent: total ? Math.round((done / total) * 100) : 0,
      }
    },

    getSplitById(id) {
      return this.splits.find(s => s.id === id) || null
    },

    getById(id) {
      return this.workouts.find(w => w.id === id) || null
    },

    clear() {
      this.splits = []
      this.workouts = []
      this.activeSplitId = null
      this.loaded = false
    },

    async loadWorkouts(splitId) {
      if (!splitId) {
        this.workouts = []
        return
      }
      const data = getData(await listWorkouts(splitId))
      this.workouts = data.workouts || []
    },

    async fetch() {
      const app = useAppStore()
      const data = getData(await listSplits())
      this.splits = data.splits || []
      this.activeSplitId = app.user.activeSplitId || this.splits[0]?.id || null
      if (this.activeSplitId && !this.getSplitById(this.activeSplitId)) {
        this.activeSplitId = this.splits[0]?.id || null
        app.setActiveSplitId(this.activeSplitId)
      }
      await this.loadWorkouts(this.activeSplitId)
      this.loaded = true
    },

    async load() {
      const snack = useSnackbarStore()

      await useLoaderStore().wrap(async () => {
        try {
          await this.fetch()
        } catch (err) {
          snack.error(apiMessage(err, 'Could not load training data'))
        }
      })
    },

    async ensureLoaded() {
      if (this.loaded) return
      await this.fetch()
    },

    async setActiveSplit(id) {
      const snack = useSnackbarStore()
      const split = this.getSplitById(id)
      if (!split) return false
      if (split.id === this.activeSplitId) return true

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await activateSplit(id))
          this.activeSplitId = data.activeSplitId
          useAppStore().setActiveSplitId(data.activeSplitId)
          await this.loadWorkouts(this.activeSplitId)
          snack.success(`Switched to ${split.title}`)
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not switch split'))
          return false
        }
      })
    },

    async addSplit(title) {
      const snack = useSnackbarStore()
      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a split name')
        return false
      }

      const { maxSplits } = useAppStore().getLimits()
      if (this.splits.length >= maxSplits) {
        snack.warning(`Split limit reached (${maxSplits})`)
        return false
      }

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await createSplit({ title: name }))
          this.splits.push(data.split)
          if (data.activeSplitId) {
            this.activeSplitId = data.activeSplitId
            useAppStore().setActiveSplitId(data.activeSplitId)
            if (data.activeSplitId === data.split.id) this.workouts = []
          }
          snack.success(`Split "${name}" created`)
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not create split'))
          return false
        }
      })
    },

    async addWorkout(title) {
      const snack = useSnackbarStore()
      const split = this.getActiveSplit()
      if (!split) {
        snack.warning('Create a split first')
        return 'need-split'
      }

      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a workout title')
        return false
      }

      const { maxWorkoutsPerSplit } = useAppStore().getLimits()
      if (this.workouts.length >= maxWorkoutsPerSplit) {
        snack.warning(`Workout limit reached (${maxWorkoutsPerSplit})`)
        return false
      }

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await createWorkout(split.id, { title: name }))
          this.workouts.push(data.workout)
          split.workoutCount = (split.workoutCount || 0) + 1
          snack.success(`Workout "${name}" created`)
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not create workout'))
          return false
        }
      })
    },

    async renameWorkout(id, title) {
      const snack = useSnackbarStore()
      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a workout title')
        return false
      }

      const w = this.getById(id)
      if (!w) return false

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await updateWorkout(id, { title: name }))
          Object.assign(w, data.workout)
          snack.success('Workout renamed')
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not rename workout'))
          return false
        }
      })
    },

    async renameSplit(id, title) {
      const snack = useSnackbarStore()
      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a split name')
        return false
      }

      const s = this.getSplitById(id)
      if (!s) return false

      return await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await renameSplitRequest(id, { title: name }))
          Object.assign(s, data.split)
          snack.success('Split renamed')
          return true
        } catch (err) {
          snack.error(apiMessage(err, 'Could not rename split'))
          return false
        }
      })
    },

    async toggleWorkout(id) {
      const snack = useSnackbarStore()
      const w = this.getById(id)
      if (!w) return

      await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await updateWorkout(id, { done: !w.done }))
          Object.assign(w, data.workout)
          snack.success(w.done ? `"${w.title}" marked done` : `"${w.title}" unmarked`)
        } catch (err) {
          snack.error(apiMessage(err, 'Could not update workout'))
        }
      })
    },

    async deleteWorkout(id) {
      const snack = useSnackbarStore()
      const w = this.getById(id)
      if (!w) return

      const ok = await useConfirmStore().ask({
        title: 'Delete workout?',
        message: `"${w.title}" and its exercises will be removed.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return

      await useLoaderStore().wrap(async () => {
        try {
          getData(await deleteWorkoutRequest(id))
          this.workouts = this.workouts.filter(item => item.id !== id)
          const split = this.getActiveSplit()
          if (split) split.workoutCount = Math.max(0, (split.workoutCount || 1) - 1)
          snack.success(`"${w.title}" deleted`)
        } catch (err) {
          snack.error(apiMessage(err, 'Could not delete workout'))
        }
      })
    },

    async deleteSplit(id) {
      const snack = useSnackbarStore()
      const s = this.getSplitById(id)
      if (!s) return

      const ok = await useConfirmStore().ask({
        title: 'Delete split?',
        message: `"${s.title}" and all its workouts will be removed.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return

      await useLoaderStore().wrap(async () => {
        try {
          const data = getData(await deleteSplitRequest(id))
          this.splits = this.splits.filter(item => item.id !== id)
          this.activeSplitId = data.activeSplitId
          useAppStore().setActiveSplitId(data.activeSplitId)
          await this.loadWorkouts(this.activeSplitId)
          snack.success(`"${s.title}" deleted`)
        } catch (err) {
          snack.error(apiMessage(err, 'Could not delete split'))
        }
      })
    },

    async openWorkout(id) {
      await useLoaderStore().wrap(() => {
        useAppStore().openWorkout(id)
      })
    },

    async findWorkout(id) {
      const local = this.getById(id)
      if (local) return local

      for (const split of this.splits) {
        if (split.id === this.activeSplitId) continue
        const data = getData(await listWorkouts(split.id))
        const found = (data.workouts || []).find(w => w.id === id)
        if (found) return found
      }
      return null
    },

    async resetProgress() {
      const snack = useSnackbarStore()
      const split = this.getActiveSplit()
      if (!split) {
        snack.info('Create a split first')
        return
      }

      const { done } = this.getProgress()
      if (!done) {
        snack.info('Progress is already clear')
        return
      }

      const ok = await useConfirmStore().ask({
        title: 'Reset progress?',
        message: `All completed workouts and exercises in "${split.title}" will be unmarked.`,
        confirmLabel: 'Reset',
      })
      if (!ok) return

      await useLoaderStore().wrap(async () => {
        try {
          getData(await resetWorkouts(split.id))
          this.workouts.forEach(w => {
            w.done = false
          })
          snack.success('Progress reset')
        } catch (err) {
          snack.error(apiMessage(err, 'Could not reset progress'))
        }
      })
    },
  },
})
