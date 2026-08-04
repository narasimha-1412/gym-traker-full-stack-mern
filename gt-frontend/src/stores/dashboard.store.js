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
        routines: [
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
        routines: [
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

    getActiveRoutines() {
      return this.getActiveSplit()?.routines || []
    },

    getProgress() {
      const routines = this.getActiveRoutines()
      const done = routines.filter(r => r.done).length
      const total = routines.length
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
        const routine = split.routines.find(r => r.id === n || r.id === id)
        if (routine) return routine
      }
      return null
    },

    findRoutineContext(id) {
      const n = Number(id)
      for (const split of this.splits) {
        const index = split.routines.findIndex(r => r.id === n || r.id === id)
        if (index >= 0) return { split, index, routine: split.routines[index] }
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
        this.splits.push({ id, title: name, routines: [] })
        if (!this.activeSplitId) this.activeSplitId = id
        snack.success(`Split "${name}" created`)
      })
      return true
    },

    async addRoutine(title) {
      const snack = useSnackbarStore()
      const split = this.getActiveSplit()
      if (!split) {
        snack.warning('Create a split first')
        return 'need-split'
      }

      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a routine title')
        return false
      }

      await useLoaderStore().wrap(() => {
        split.routines.push({
          id: ++uid,
          title: name,
          done: false,
          exercises: [],
        })
        snack.success(`Routine "${name}" created`)
      })
      return true
    },

    async renameRoutine(id, title) {
      const snack = useSnackbarStore()
      const name = title?.trim()
      if (!name) {
        snack.warning('Enter a routine title')
        return false
      }

      const r = this.getById(id)
      if (!r) return false

      await useLoaderStore().wrap(() => {
        r.title = name
        snack.success('Routine renamed')
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

    async toggleRoutine(id) {
      const r = this.getById(id)
      if (!r) return

      await useLoaderStore().wrap(() => {
        r.done = !r.done
        useSnackbarStore().success(r.done ? `"${r.title}" marked done` : `"${r.title}" unmarked`)
      })
    },

    async deleteRoutine(id) {
      const ctx = this.findRoutineContext(id)
      if (!ctx) return

      const ok = await useConfirmStore().ask({
        title: 'Delete routine?',
        message: `"${ctx.routine.title}" and its exercises will be removed.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        ctx.split.routines = ctx.split.routines.filter(item => item.id !== id)
        useSnackbarStore().success(`"${ctx.routine.title}" deleted`)
      })
    },

    async deleteSplit(id) {
      const s = this.getSplitById(id)
      if (!s) return

      const ok = await useConfirmStore().ask({
        title: 'Delete split?',
        message: `"${s.title}" and all its routines will be removed.`,
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
        message: `All completed routines in "${split.title}" will be unmarked.`,
        confirmLabel: 'Reset',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        split.routines.forEach(r => {
          r.done = false
        })
        useSnackbarStore().success('Workout progress reset')
      })
    },
  },
})
