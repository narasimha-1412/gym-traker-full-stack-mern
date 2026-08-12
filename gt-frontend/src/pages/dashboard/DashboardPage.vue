<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useSnackbarStore } from '@/stores/snackbar.store'
import ProgressRing from './ProgressRing.vue'
import WorkoutCard from './WorkoutCard.vue'
import SplitCard from './SplitCard.vue'

const app = useAppStore()
const dash = useDashboardStore()
const settings = useSettingsStore()
const snack = useSnackbarStore()

onMounted(() => {
  dash.load()
})

const tab = ref('workouts')
const addOpen = ref(false)
const newTitle = ref('')
const editOpen = ref(false)
const editId = ref(null)
const editTitle = ref('')
const editKind = ref('workout')

function openAdd() {
  if (tab.value === 'workouts' && !dash.getActiveSplit()) {
    snack.warning('Create a split first')
    tab.value = 'splits'
    return
  }
  newTitle.value = ''
  addOpen.value = true
}

function closeAdd() {
  addOpen.value = false
  newTitle.value = ''
}

async function submitAdd() {
  if (tab.value === 'splits') {
    if (await dash.addSplit(newTitle.value)) closeAdd()
    return
  }

  const result = await dash.addWorkout(newTitle.value)
  if (result === 'need-split') {
    closeAdd()
    tab.value = 'splits'
    return
  }
  if (result) closeAdd()
}

function openEditWorkout(id) {
  const w = dash.getById(id)
  if (!w) return
  editKind.value = 'workout'
  editId.value = id
  editTitle.value = w.title
  editOpen.value = true
}

function openEditSplit(id) {
  const s = dash.getSplitById(id)
  if (!s) return
  editKind.value = 'split'
  editId.value = id
  editTitle.value = s.title
  editOpen.value = true
}

function closeEdit() {
  editOpen.value = false
  editId.value = null
  editTitle.value = ''
  editKind.value = 'workout'
}

async function saveEdit() {
  const ok =
    editKind.value === 'split'
      ? await dash.renameSplit(editId.value, editTitle.value)
      : await dash.renameWorkout(editId.value, editTitle.value)
  if (ok) closeEdit()
}

async function selectSplit(id) {
  if (await dash.setActiveSplit(id)) tab.value = 'workouts'
}
</script>

<template>
  <div class="dashboard">
    <v-app-bar flat class="bar" height="64">
      <div class="brand">
        <div class="mark">
          <v-icon icon="mdi-dumbbell" size="18" />
        </div>
        <span class="wordmark">Gym<span>Trakio</span></span>
      </div>
      <v-spacer />
      <div class="user-block">
        <v-tooltip location="bottom" :text="app.user.name">
          <template #activator="{ props }">
            <v-avatar v-bind="props" size="36" class="avatar">{{ app.user.avatar }}</v-avatar>
          </template>
        </v-tooltip>
        <v-btn
          v-if="app.isAdmin()"
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
        <ProgressRing :percent="dash.getProgress().percent" :size="76" />
        <div class="progress-meta">
          <p class="panel-label">
            Workout progress
            <!-- for -->
            <!-- <span v-if="dash.getActiveSplit()" class="split-name">{{
              dash.getActiveSplit()?.title
            }}</span> -->
          </p>
          <p class="panel-text">
            <template v-if="dash.getActiveSplit()">
              <span class="mono">{{ dash.getProgress().done }}</span> of
              <span class="mono">{{ dash.getProgress().total }}</span> workouts completed
            </template>
            <template v-else>Create a split to track progress</template>
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

      <v-tabs v-model="tab" class="dash-tabs" color="primary" density="comfortable">
        <v-tab value="workouts">Workouts</v-tab>
        <v-tab value="splits">Splits</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab" class="tabs-window">
        <v-tabs-window-item value="workouts">
          <div v-if="!dash.getActiveSplit()" class="empty">
            <p class="empty-title">No active split</p>
            <p class="empty-text">Create a split first, then add workouts.</p>
            <button class="btn-gradient" type="button" @click="tab = 'splits'">Go to Splits</button>
          </div>
          <div v-else-if="!dash.getActiveWorkouts().length" class="empty">
            <p class="empty-title">No workouts yet</p>
            <p class="empty-text">Add a workout to "{{ dash.getActiveSplit().title }}".</p>
          </div>
          <v-row v-else density="comfortable">
            <v-col v-for="w in dash.getActiveWorkouts()" :key="w.id" cols="12" sm="6" md="4">
              <WorkoutCard
                :workout="w"
                @toggle="dash.toggleWorkout"
                @open="dash.openWorkout"
                @edit="openEditWorkout"
                @delete="dash.deleteWorkout"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="splits">
          <div v-if="!dash.splits.length" class="empty">
            <p class="empty-title">No splits yet</p>
            <p class="empty-text">Create your first split to organize workouts.</p>
          </div>
          <v-row v-else density="comfortable">
            <v-col v-for="s in dash.splits" :key="s.id" cols="12" sm="6" md="4">
              <SplitCard
                :split="s"
                :active="s.id === dash.activeSplitId"
                @select="selectSplit"
                @edit="openEditSplit"
                @delete="dash.deleteSplit"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <button
      class="fab"
      type="button"
      :aria-label="tab === 'splits' ? 'Add split' : 'Add workout'"
      @click="openAdd()"
    >
      <v-icon icon="mdi-plus" size="28" />
    </button>

    <v-dialog
      :model-value="addOpen"
      max-width="400"
      content-class="dlg"
      @update:model-value="v => !v && closeAdd()"
    >
      <v-card class="dlg-card">
        <v-card-title class="dlg-title">
          {{ tab === 'splits' ? 'Add split' : 'Add workout' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTitle"
            :label="tab === 'splits' ? 'Split name' : 'Workout title'"
            prepend-inner-icon="mdi-dumbbell"
            rounded="lg"
            autofocus
            @keyup.enter="submitAdd()"
          />
        </v-card-text>
        <v-card-actions class="dlg-actions">
          <v-btn variant="outlined" class="btn-ghost" @click="closeAdd()">Cancel</v-btn>
          <button class="btn-gradient" type="button" @click="submitAdd()">Add</button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="editOpen"
      max-width="400"
      content-class="dlg"
      @update:model-value="v => !v && closeEdit()"
    >
      <v-card class="dlg-card">
        <v-card-title class="dlg-title">
          {{ editKind === 'split' ? 'Rename split' : 'Rename workout' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editTitle"
            :label="editKind === 'split' ? 'Split name' : 'Workout title'"
            prepend-inner-icon="mdi-pencil-outline"
            rounded="lg"
            autofocus
            @keyup.enter="saveEdit()"
          />
        </v-card-text>
        <v-card-actions class="dlg-actions">
          <v-btn variant="outlined" class="btn-ghost" @click="closeEdit()">Cancel</v-btn>
          <button class="btn-gradient" type="button" @click="saveEdit()">Save</button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  background: $bg;
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
  margin-bottom: 12px;
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

.split-name {
  color: $blue;
  font-size: 0.95rem;
  font-weight: 600;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
  color: $blue;
}

.dash-tabs {
  margin-bottom: 12px;
}

.tabs-window {
  min-height: 120px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 28px 20px;
  background: $surface;
  border: 1px dashed $stroke;
  border-radius: $radius;
}

.empty-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: $text;
}

.empty-text {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: $muted;
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
