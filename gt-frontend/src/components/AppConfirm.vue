<script setup>
import { useConfirmStore } from '@/stores/confirm.store'

const confirm = useConfirmStore()
</script>

<template>
  <v-dialog
    :model-value="confirm.open"
    max-width="380"
    @update:model-value="v => !v && confirm.settle(false)"
  >
    <v-card class="dlg-card">
      <v-card-title class="dlg-title">{{ confirm.title }}</v-card-title>
      <v-card-text v-if="confirm.message" class="dlg-msg">
        {{ confirm.message }}
      </v-card-text>
      <v-card-actions class="dlg-actions">
        <v-btn variant="outlined" class="btn-ghost" @click="confirm.settle(false)">
          {{ confirm.cancelLabel }}
        </v-btn>
        <button
          type="button"
          :class="confirm.danger ? 'btn-danger' : 'btn-gradient'"
          @click="confirm.settle(true)"
        >
          {{ confirm.confirmLabel }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.dlg-card {
  background: $surface !important;
  border: 1px solid $stroke;
  border-radius: $radius !important;
}

.dlg-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  color: $text;
}

.dlg-msg {
  padding-top: 4px !important;
  font-size: 0.9rem;
  line-height: 1.45;
  color: $muted;
}

.dlg-actions {
  padding: 8px 16px 16px;
  gap: 8px;
  justify-content: flex-end;
}

.btn-ghost {
  border-color: $stroke !important;
  color: $muted !important;
  text-transform: none;
}

.btn-gradient,
.btn-danger {
  min-width: 88px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: $radius-btn;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
}

.btn-gradient {
  background: $gradient;
}

.btn-danger {
  background: $red;
}
</style>
