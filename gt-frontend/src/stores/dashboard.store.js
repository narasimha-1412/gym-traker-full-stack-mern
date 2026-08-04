import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'

let uid = 100

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    splits: [
      {
        id: 1,
        title: 'PPL Bulk',
        workouts: [
          {
            id: 1,
            title: 'Push Day',
            done: true,
            exercises: [
              {
                id: 11,
                name: 'Bench Press',
                weight: '80',
                description: '4 sets · controlled tempo',
                done: true,
              },
              {
                id: 12,
                name: 'Overhead Press',
                weight: '45',
                description: '3 sets · full range',
                done: false,
              },
            ],
          },
          {
            id: 2,
            title: 'Pull Day',
            done: false,
            exercises: [
              {
                id: 21,
                name: 'Deadlift',
                weight: '120',
                description: '3 sets · hinge focus',
                done: false,
              },
              {
                id: 22,
                name: 'Barbell Row',
                weight: '70',
                description: '4 sets · squeeze top',
                done: false,
              },
              {
                id: 23,
                name: 'Pull-ups',
                weight: '',
                description: '3 sets to failure',
                done: false,
              },
            ],
          },
          {
            id: 3,
            title: 'Leg Day',
            done: false,
            exercises: [
              {
                id: 31,
                name: 'Back Squat',
                weight: '100',
                description: '5 sets · depth priority',
                done: false,
              },
              {
                id: 32,
                name: 'Romanian DL',
                weight: '80',
                description: '3 sets · hamstring stretch',
                done: false,
              },
            ],
          },
          {
            id: 4,
            title: 'Core & Mobility',
            done: false,
            exercises: [
              {
                id: 41,
                name: 'Hanging Knee Raise',
                weight: '',
                description: '3 sets · slow',
                done: false,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Home Gym',
        workouts: [
          {
            id: 5,
            title: 'Full Body A',
            done: false,
            exercises: [
              {
                id: 51,
                name: 'Goblet Squat',
                weight: '24',
                description: '4 sets',
                done: false,
              },
              {
                id: 52,
                name: 'Push-ups',
                weight: '',
                description: '3 sets',
                done: false,
              },
            ],
          },
        ],
      },
    ],
    activeSplitId: 1,
  }),

  actions: {
    getActiveSplit() {
      return this.splits.find(s => s.id === this.activeSplitId) || null
    },

    getActiveWorkouts() {
      return this.getActiveSplit()?.workouts || []
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
      const n = Number(id)
      return this.splits.find(s => s.id === n || s.id === id)
    },

    getById(id) {
      const n = Number(id)
      for (const split of this.splits) {
        const workout = split.workouts.find(w => w.id === n || w.id === id)
        if (workout) return workout
      }
      return null
    },

    findWorkoutContext(id) {
      const n = Number(id)
      for (const split of this.splits) {
        const index = split.workouts.findIndex(w => w.id === n || w.id === id)
        if (index >= 0) return { split, index, workout: split.workouts[index] }
      }
      return null
    },

    nextId() {
      return ++uid
    },

    async setActiveSplit(id) {
      const split = this.getSplitById(id)
      if (!split) return false
      if (split.id === this.activeSplitId) return true

      await useLoaderStore().wrap(() => {
        this.activeSplitId = split.id
        useSnackbarStore().success(`Switched to ${split.title}`)
      })
      return true
    },

    async addSplit(title) {
      const snack = useSnackbarStore()
      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a split name')
        return false
      }

      await useLoaderStore().wrap(() => {
        const id = ++uid
        this.splits.push({ id, title: name, workouts: [] })
        if (!this.activeSplitId) this.activeSplitId = id
        snack.success(`Split "${name}" created`)
      })
      return true
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

      await useLoaderStore().wrap(() => {
        split.workouts.push({
          id: ++uid,
          title: name,
          done: false,
          exercises: [],
        })
        snack.success(`Workout "${name}" created`)
      })
      return true
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

      await useLoaderStore().wrap(() => {
        w.title = name
        snack.success('Workout renamed')
      })
      return true
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

      await useLoaderStore().wrap(() => {
        s.title = name
        snack.success('Split renamed')
      })
      return true
    },

    async toggleWorkout(id) {
      const w = this.getById(id)
      if (!w) return

      await useLoaderStore().wrap(() => {
        w.done = !w.done
        useSnackbarStore().success(w.done ? `"${w.title}" marked done` : `"${w.title}" unmarked`)
      })
    },

    async deleteWorkout(id) {
      const ctx = this.findWorkoutContext(id)
      if (!ctx) return

      const ok = await useConfirmStore().ask({
        title: 'Delete workout?',
        message: `"${ctx.workout.title}" and its exercises will be removed.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        ctx.split.workouts = ctx.split.workouts.filter(item => item.id !== id)
        useSnackbarStore().success(`"${ctx.workout.title}" deleted`)
      })
    },

    async deleteSplit(id) {
      const s = this.getSplitById(id)
      if (!s) return

      const ok = await useConfirmStore().ask({
        title: 'Delete split?',
        message: `"${s.title}" and all its workouts will be removed.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        this.splits = this.splits.filter(item => item.id !== id)
        if (this.activeSplitId === id) {
          this.activeSplitId = this.splits[0]?.id ?? null
        }
        useSnackbarStore().success(`"${s.title}" deleted`)
      })
    },

    async openWorkout(id) {
      await useLoaderStore().wrap(() => {
        useAppStore().openWorkout(id)
      })
    },

    async resetProgress() {
      const split = this.getActiveSplit()
      if (!split) {
        useSnackbarStore().info('Create a split first')
        return
      }

      const { done } = this.getProgress()
      if (!done) {
        useSnackbarStore().info('Progress is already clear')
        return
      }

      const ok = await useConfirmStore().ask({
        title: 'Reset progress?',
        message: `All completed workouts in "${split.title}" will be unmarked.`,
        confirmLabel: 'Reset',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        split.workouts.forEach(w => {
          w.done = false
        })
        useSnackbarStore().success('Workout progress reset')
      })
    },
  },
})
