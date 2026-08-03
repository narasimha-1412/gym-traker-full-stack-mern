<script setup>
import AppSnackbar from '@/components/AppSnackbar.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppConfirm from '@/components/AppConfirm.vue'
</script>

<template>
  <v-app class="iron-app">
    <v-main>
      <router-view />
    </v-main>
    <AppSnackbar />
    <AppLoader />
    <AppConfirm />
  </v-app>
</template>

<style lang="scss">
.iron-app {
  background: $bg !important;
  font-family: 'Inter', system-ui, sans-serif;
  color: $text;
}

.v-application {
  background: $bg !important;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: $bg;
  -webkit-font-smoothing: antialiased;
}
</style>
