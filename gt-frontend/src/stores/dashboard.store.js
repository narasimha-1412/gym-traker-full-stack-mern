import { defineStore } from 'pinia'
import { useAppStore } from './app.store'
import { useSnackbarStore } from './snackbar.store'
import { useLoaderStore } from './loader.store'
import { useConfirmStore } from './confirm.store'

let uid = 100

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
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
          { id: 23, name: 'Pull-ups', weight: '', description: '3 sets to failure', done: false },
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
    addOpen: false,
    newTitle: '',
    editOpen: false,
    editId: null,
    editTitle: '',
  }),

  getters: {
    doneCount: state => state.routines.filter(r => r.done).length,
    totalCount: state => state.routines.length,
    progress() {
      return this.totalCount ? Math.round((this.doneCount / this.totalCount) * 100) : 0
    },
  },

  actions: {
    getById(id) {
      const n = Number(id)
      return this.routines.find(r => r.id === n || r.id === id)
    },

    async toggleRoutine(id) {
      const r = this.getById(id)
      if (!r) return

      await useLoaderStore().wrap(() => {
        r.done = !r.done
        useSnackbarStore().success(r.done ? `"${r.title}" marked done` : `"${r.title}" unmarked`)
      })
    },

    async addRoutine() {
      const snack = useSnackbarStore()
      if (!this.newTitle?.trim()) {
        snack.warning('Enter a routine title')
        return
      }

      const title = this.newTitle.trim()
      await useLoaderStore().wrap(() => {
        this.routines.push({ id: ++uid, title, done: false, exercises: [] })
        this.newTitle = ''
        this.addOpen = false
        snack.success(`Routine "${title}" created`)
      })
    },

    openEdit(id) {
      const r = this.getById(id)
      if (!r) return
      this.editId = id
      this.editTitle = r.title
      this.editOpen = true
    },

    closeEdit() {
      this.editOpen = false
      this.editId = null
      this.editTitle = ''
    },

    async renameRoutine() {
      const snack = useSnackbarStore()
      const title = this.editTitle?.trim()
      if (!title) {
        snack.warning('Enter a routine title')
        return
      }

      const r = this.getById(this.editId)
      if (!r) {
        this.closeEdit()
        return
      }

      await useLoaderStore().wrap(() => {
        r.title = title
        this.closeEdit()
        snack.success('Routine renamed')
      })
    },

    async deleteRoutine(id) {
      const r = this.getById(id)
      if (!r) return

      const ok = await useConfirmStore().ask({
        title: 'Delete routine?',
        message: `"${r.title}" and its exercises will be removed.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        this.routines = this.routines.filter(item => item.id !== id)
        useSnackbarStore().success(`"${r.title}" deleted`)
      })
    },

    async openWorkout(id) {
      await useLoaderStore().wrap(() => {
        useAppStore().openWorkout(id)
      })
    },

    async resetProgress() {
      if (!this.doneCount) {
        useSnackbarStore().info('Progress is already clear')
        return
      }

      const ok = await useConfirmStore().ask({
        title: 'Reset progress?',
        message: 'All completed routines will be unmarked.',
        confirmLabel: 'Reset',
      })
      if (!ok) return

      await useLoaderStore().wrap(() => {
        this.routines.forEach(r => {
          r.done = false
        })
        useSnackbarStore().success('Workout progress reset')
      })
    },

    nextId() {
      return ++uid
    },
  },
})
