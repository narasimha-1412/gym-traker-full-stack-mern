<script setup>
import { useAppStore } from '@/stores/app.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useSettingsStore } from '@/stores/settings.store'
import ProgressRing from './ProgressRing.vue'
import RoutineCard from './RoutineCard.vue'

const app = useAppStore()
const dash = useDashboardStore()
const settings = useSettingsStore()
</script>

<template>
  <div class="dashboard">
    <v-app-bar flat class="bar" height="64">
      <div class="brand">
        <div class="mark">
          <v-icon icon="mdi-dumbbell" size="18" />
        </div>
        <span class="wordmark">IRON<span>LOG</span></span>
      </div>
      <v-spacer />
      <div class="user-block">
        <v-tooltip location="bottom" :text="app.user.name">
          <template #activator="{ props }">
            <v-avatar v-bind="props" size="36" class="avatar">{{ app.user.avatar }}</v-avatar>
          </template>
        </v-tooltip>
        <v-btn
          v-if="app.isAdmin"
          icon
          variant="text"
          size="small"
          aria-label="Users"
          @click="app.goUsers()"
        >
          <v-icon icon="mdi-account-multiple-outline" />
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          class="gear"
          aria-label="Settings"
          @click="settings.enter()"
        >
          <v-icon icon="mdi-cog-outline" class="spin-hover" />
        </v-btn>
      </div>
    </v-app-bar>

    <div class="content">
      <div class="progress-panel">
        <ProgressRing :percent="dash.progress" :size="76" />
        <div class="progress-meta">
          <p class="panel-label">Workout progress</p>
          <p class="panel-text">
            <span class="mono">{{ dash.doneCount }}</span> of
            <span class="mono">{{ dash.totalCount }}</span> routines completed
          </p>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          class="reset-btn"
          aria-label="Reset progress"
          @click="dash.resetProgress()"
        >
          <v-icon icon="mdi-refresh" class="reset-icon" />
        </v-btn>
      </div>

      <v-row dense>
        <v-col v-for="r in dash.routines" :key="r.id" cols="12" sm="6" md="4">
          <RoutineCard
            :routine="r"
            @toggle="dash.toggleRoutine"
            @open="dash.openWorkout"
            @edit="dash.openEdit"
            @delete="dash.deleteRoutine"
          />
        </v-col>
      </v-row>
    </div>

    <button class="fab" type="button" aria-label="Add routine" @click="dash.addOpen = true">
      <v-icon icon="mdi-plus" size="28" />
    </button>

    <v-dialog v-model="dash.addOpen" max-width="400" content-class="dlg">
      <v-card class="dlg-card">
        <v-card-title class="dlg-title">Add routine</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="dash.newTitle"
            label="Routine title"
            prepend-inner-icon="mdi-dumbbell"
            rounded="lg"
            autofocus
            @keyup.enter="dash.addRoutine()"
          />
        </v-card-text>
        <v-card-actions class="dlg-actions">
          <v-btn variant="outlined" class="btn-ghost" @click="dash.addOpen = false">Cancel</v-btn>
          <button class="btn-gradient" type="button" @click="dash.addRoutine()">Add</button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="dash.editOpen"
      max-width="400"
      content-class="dlg"
      @update:model-value="v => !v && dash.closeEdit()"
    >
      <v-card class="dlg-card">
        <v-card-title class="dlg-title">Rename routine</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="dash.editTitle"
            label="Routine title"
            prepend-inner-icon="mdi-pencil-outline"
            rounded="lg"
            autofocus
            @keyup.enter="dash.renameRoutine()"
          />
        </v-card-text>
        <v-card-actions class="dlg-actions">
          <v-btn variant="outlined" class="btn-ghost" @click="dash.closeEdit()">Cancel</v-btn>
          <button class="btn-gradient" type="button" @click="dash.renameRoutine()">Save</button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  min-height: 100dvh;
  background: $bg;
  padding-bottom: 96px;
}

.bar {
  background: $surface !important;
  border-bottom: 1px solid $stroke;
  padding-inline: 8px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mark {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $gradient;
  display: grid;
  place-items: center;
  color: #fff;
}

.wordmark {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  color: $text;

  span {
    background: $gradient;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

.user-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  background: $gradient !important;
  font-size: 0.75rem;
  font-weight: 700;
}

.spin-hover {
  transition: transform 0.4s ease;
}
.gear:hover .spin-hover {
  transform: rotate(90deg);
}

.content {
  padding: 16px;
  max-width: 1100px;
  margin: 0 auto;
}

.progress-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius;
}

.progress-meta {
  flex: 1;
  min-width: 0;
}

.reset-btn {
  align-self: flex-start;
  color: $muted !important;
  transition: color 0.2s ease;

  &:hover {
    color: $blue !important;
    .reset-icon {
      transform: rotate(-180deg);
    }
  }
}

.reset-icon {
  transition: transform 0.35s ease;
}

.panel-label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $muted;
}

.panel-text {
  margin: 4px 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
  color: $blue;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: calc(20px + env(safe-area-inset-bottom));
  z-index: 20;
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 50%;
  background: $gradient;
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 24px rgba($blue, 0.35);
  cursor: pointer;
  animation: fab-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.08) rotate(90deg);
  }
  &:active {
    transform: scale(0.95);
  }
}

@keyframes fab-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.dlg-card {
  background: $surface !important;
  border: 1px solid $stroke;
  border-radius: $radius !important;
}

.dlg-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
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

.btn-gradient {
  min-width: 88px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: $radius-btn;
  background: $gradient;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  cursor: pointer;
  &:active {
    transform: scale(0.97);
  }
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
</style>
