import { defineStore } from 'pinia'

const ICONS = {
  success: 'mdi-check-circle-outline',
  error: 'mdi-alert-circle-outline',
  warning: 'mdi-alert-outline',
  info: 'mdi-information-outline',
}

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    open: false,
    message: '',
    type: 'info', // success | error | warning | info
    timeout: 3200,
  }),

  getters: {
    icon: (state) => ICONS[state.type] || ICONS.info,
  },

  actions: {
    show(msg, t = 'info', ms = 3200) {
      this.message = msg
      this.type = t
      this.timeout = ms
      this.open = false
      requestAnimationFrame(() => { this.open = true })
    },

    success(msg) { this.show(msg, 'success') },
    error(msg) { this.show(msg, 'error') },
    warning(msg) { this.show(msg, 'warning') },
    info(msg) { this.show(msg, 'info') },

    close() {
      this.open = false
    },
  },
})
