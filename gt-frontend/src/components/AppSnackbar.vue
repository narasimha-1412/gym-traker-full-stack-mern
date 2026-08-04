<script setup>
import { useSnackbarStore } from '@/stores/snackbar.store'

const snack = useSnackbarStore()
</script>

<template>
  <v-snackbar
    v-model="snack.open"
    class="app-snackbar"
    :class="snack.type"
    location="top end"
    :timeout="snack.timeout"
    multi-line
  >
    <div class="body">
      <v-icon :icon="snack.getIcon()" size="20" class="icon" />
      <span>{{ snack.message }}</span>
    </div>
    <template #actions>
      <v-btn icon variant="text" size="small" aria-label="Close" @click="snack.close()">
        <v-icon icon="mdi-close" size="18" />
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped lang="scss">
.app-snackbar {
  :deep(.v-snackbar__wrapper) {
    min-width: 260px;
    max-width: min(360px, calc(100vw - 24px));
    margin: 12px 12px 0 0 !important;
    border-radius: $radius-btn !important;
    border: 1px solid $stroke;
    background: $surface !important;
    color: $text !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  }

  &.success :deep(.v-snackbar__wrapper) {
    border-color: rgba(#34d399, 0.45);
    .icon {
      color: #34d399;
    }
  }
  &.error :deep(.v-snackbar__wrapper) {
    border-color: rgba($red, 0.5);
    .icon {
      color: $red;
    }
  }
  &.warning :deep(.v-snackbar__wrapper) {
    border-color: rgba(#f59e0b, 0.5);
    .icon {
      color: #f59e0b;
    }
  }
  &.info :deep(.v-snackbar__wrapper) {
    border-color: rgba($blue, 0.45);
    .icon {
      color: $blue;
    }
  }
}

.body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1.4;
  padding-block: 2px;
}

.icon {
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
