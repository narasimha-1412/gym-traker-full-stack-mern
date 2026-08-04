import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { useAppStore } from './stores/app.store'

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store }) => {
  store.router = markRaw(router)
})

app.use(pinia)

await useAppStore().bootstrap()

app.use(router).use(vuetify).mount('#app')
