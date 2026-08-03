import { defineStore } from 'pinia'

export const useConfirmStore = defineStore('confirm', {
  state: () => ({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    danger: true,
    _resolve: null,
  }),

  actions: {
    ask({
      title,
      message,
      confirmLabel = 'Delete',
      cancelLabel = 'Cancel',
      danger = true,
    } = {}) {
      return new Promise((resolve) => {
        this.title = title || 'Are you sure?'
        this.message = message || ''
        this.confirmLabel = confirmLabel
        this.cancelLabel = cancelLabel
        this.danger = danger
        this._resolve = resolve
        this.open = true
      })
    },

    settle(ok) {
      this.open = false
      const resolve = this._resolve
      this._resolve = null
      resolve?.(!!ok)
    },
  },
})
