import { defineStore } from 'pinia'

const DEFAULT_MS = 700

export const useLoaderStore = defineStore('loader', {
  state: () => ({
    active: false,
    pending: 0,
  }),

  actions: {
    show() {
      this.pending += 1
      this.active = true
    },

    hide() {
      this.pending = Math.max(0, this.pending - 1)
      this.active = this.pending > 0
    },

    async wrap(fn, ms = DEFAULT_MS) {
      this.show()
      try {
        await new Promise((resolve) => setTimeout(resolve, ms))
        return await fn()
      } finally {
        this.hide()
      }
    },
  },
})
