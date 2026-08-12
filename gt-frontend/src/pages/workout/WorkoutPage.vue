<script setup>
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workout.store'
import { useSnackbarStore } from '@/stores/snackbar.store'

const route = useRoute()
const router = useRouter()
const workout = useWorkoutStore()

const expandedId = ref(null)
const dialogOpen = ref(false)
const dialogMode = ref('add')
const form = ref({ name: '', weight: '', weightUnit: 'kg', description: '' })

function loadFromRoute(workoutId = route.params.workoutId) {
  const id = String(workoutId || '')
  expandedId.value = null
  return workout.loadDraft(id).then(ok => {
    if (!ok) {
      useSnackbarStore().error('Workout not found')
      router.replace({ name: 'dashboard' })
    }
  })
}

onMounted(() => {
  loadFromRoute()
})
onBeforeRouteUpdate(to => {
  return loadFromRoute(to.params.workoutId)
})

function toggleExpand(exId) {
  expandedId.value = expandedId.value === exId ? null : exId
}

function openAdd() {
  dialogMode.value = 'add'
  form.value = { name: '', weight: '', weightUnit: 'kg', description: '' }
  dialogOpen.value = true
}

function openEdit(ex) {
  dialogMode.value = 'edit'
  form.value = {
    ...ex,
    weight: workout.sanitizeWeight(ex.weight),
    weightUnit: ex.weightUnit === 'lb' ? 'lb' : 'kg',
  }
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

function setWeight(value) {
  form.value.weight = workout.sanitizeWeight(value)
}

async function saveExercise() {
  if (await workout.saveExercise(dialogMode.value, form.value)) closeDialog()
}

async function deleteExercise(exId) {
  if ((await workout.deleteExercise(exId)) && expandedId.value === exId) {
    expandedId.value = null
  }
}

function onWeightKeydown(e) {
  const allow = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allow.includes(e.key)) return
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
  if (/^\d$/.test(e.key)) return
  if (e.key === '.' && !String(form.value.weight ?? '').includes('.')) return
  e.preventDefault()
}
</script>

<template>
  <div v-if="workout.draft" class="workout">
    <v-app-bar flat class="bar" height="56">
      <v-btn icon variant="text" aria-label="Back" @click="workout.goBack()">
        <v-icon icon="mdi-arrow-left" class="back-icon" />
      </v-btn>
      <v-toolbar-title class="title">{{ workout.draft.title }}</v-toolbar-title>
    </v-app-bar>

    <div class="content">
      <div class="count-bar">
        <span class="count-label">Exercises</span>
        <span class="count-value">{{ workout.draft.exercises.length }}</span>
      </div>

      <div class="panel">
        <div v-if="!workout.draft.exercises.length" class="empty">
          <v-icon icon="mdi-weight-lifter" size="40" class="empty-icon" />
          <p>No exercises yet</p>
          <span>Tap + to get started</span>
        </div>

        <div v-else class="table">
          <div class="thead">
            <span aria-hidden="true" />
            <span>Exercise</span>
            <span>Weight</span>
            <span class="actions-h">Actions</span>
          </div>

          <div
            v-for="ex in workout.draft.exercises"
            :key="ex.id"
            class="accordion"
            :class="{ open: expandedId === ex.id, done: ex.done }"
          >
            <div
              class="row"
              role="button"
              tabindex="0"
              @click="toggleExpand(ex.id)"
              @keydown.enter.prevent="toggleExpand(ex.id)"
            >
              <div class="cell check" @click.stop>
                <v-checkbox-btn
                  :model-value="ex.done"
                  color="success"
                  density="compact"
                  aria-label="Mark exercise done"
                  @update:model-value="workout.toggleExercise(ex.id)"
                />
              </div>

              <div class="cell name-wrap">
                <p class="cell name">{{ ex.name }}</p>
                <v-icon
                  :icon="expandedId === ex.id ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  size="18"
                  class="chevron"
                />
              </div>

              <p class="cell weight">
                {{ ex.weight ? `${ex.weight} ${ex.weightUnit === 'lb' ? 'lb' : 'kg'}` : '—' }}
              </p>

              <div class="cell actions" @click.stop>
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      size="small"
                      class="menu-btn"
                      aria-label="Exercise actions"
                    >
                      <v-icon icon="mdi-dots-vertical" size="20" />
                    </v-btn>
                  </template>
                  <v-list density="compact" class="menu-list">
                    <v-list-item
                      prepend-icon="mdi-pencil-outline"
                      title="Edit"
                      @click="openEdit(ex)"
                    />
                    <v-list-item
                      prepend-icon="mdi-delete-outline"
                      title="Delete"
                      class="danger"
                      @click="deleteExercise(ex.id)"
                    />
                  </v-list>
                </v-menu>
              </div>
            </div>

            <div v-show="expandedId === ex.id" class="detail">
              <p class="detail-label">Description</p>
              <p class="detail-text">
                {{ ex.description || 'No description' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="fab" type="button" aria-label="Add exercise" @click="openAdd()">
      <v-icon icon="mdi-plus" size="28" />
    </button>

    <v-dialog
      :model-value="dialogOpen"
      max-width="420"
      @update:model-value="v => !v && closeDialog()"
    >
      <v-card class="dlg-card">
        <v-card-title class="dlg-title">
          {{ dialogMode === 'edit' ? 'Edit exercise' : 'Add exercise' }}
        </v-card-title>
        <v-card-text class="dlg-fields">
          <v-text-field
            v-model="form.name"
            label="Name"
            prepend-inner-icon="mdi-arm-flex"
            rounded="lg"
          />
          <div class="weight-row">
            <v-text-field
              :model-value="form.weight"
              label="Weight"
              type="text"
              inputmode="decimal"
              prepend-inner-icon="mdi-weight"
              rounded="lg"
              hide-details="auto"
              class="weight-field"
              @keydown="onWeightKeydown"
              @update:model-value="setWeight"
            />
            <div class="unit-toggle" role="group" aria-label="Weight unit">
              <button
                type="button"
                class="unit-btn"
                :class="{ active: form.weightUnit === 'kg' }"
                @click="form.weightUnit = 'kg'"
              >
                kg
              </button>
              <button
                type="button"
                class="unit-btn"
                :class="{ active: form.weightUnit === 'lb' }"
                @click="form.weightUnit = 'lb'"
              >
                lb
              </button>
            </div>
          </div>
          <v-textarea
            v-model="form.description"
            label="Description"
            prepend-inner-icon="mdi-text"
            rounded="lg"
            variant="outlined"
            rows="3"
            auto-grow
            max-rows="6"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="dlg-actions">
          <v-btn variant="outlined" class="btn-ghost" @click="closeDialog()">Cancel</v-btn>
          <button class="btn-gradient" type="button" @click="saveExercise()">
            {{ dialogMode === 'edit' ? 'Update' : 'Add' }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.workout {
  background: $bg;
  display: flex;
  flex-direction: column;
}

.bar {
  background: $surface !important;
  border-bottom: 1px solid $stroke;
}

.back-icon {
  transition: transform 0.2s ease;
}
.bar :deep(.v-btn:hover) .back-icon {
  transform: translateX(-3px);
}

.title {
  font-family: 'Space Grotesk', sans-serif !important;
  font-weight: 600 !important;
  font-size: 1.05rem !important;
}

.content {
  flex: 1;
  padding: 12px 16px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.count-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 14px;
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius;
}

.count-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: $muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.count-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: $text;
  font-variant-numeric: tabular-nums;
}

.panel {
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius;
  overflow: hidden;
}

.empty {
  padding: 48px 20px;
  text-align: center;
  color: $muted;

  p {
    margin: 12px 0 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    color: $text;
  }
  span {
    font-size: 0.85rem;
  }
}

.empty-icon {
  opacity: 0.5;
  animation: float 2.5s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.table {
  width: 100%;
}

.thead,
.row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 64px 50px;
  gap: 8px;
  align-items: center;
  min-height: 52px;
  padding: 0 12px;

  @media (min-width: 700px) {
    grid-template-columns: 44px minmax(0, 1fr) 80px 54px;
    gap: 12px;
    padding: 0 14px;
  }
}

.thead {
  min-height: 40px;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $muted;
  border-bottom: 1px solid $stroke;
  background: $surface-2;
}

.actions-h {
  text-align: right;
}

.accordion {
  border-bottom: 1px solid $stroke;

  &:last-child {
    border-bottom: none;
  }
  &.done .name {
    text-decoration: line-through;
    color: $muted;
  }
  &.open .detail {
    border-top: 1px solid $stroke;
  }
}

.row {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:active {
    background: rgba($blue, 0.05);
  }
}

.cell {
  margin: 0;
  min-width: 0;
  font-size: 0.9rem;
  line-height: 1.3;
  color: $text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check,
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.actions {
  justify-content: flex-end;
}

.name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  flex-shrink: 0;
  color: $muted;
  transition: transform 0.2s ease;
}

.accordion.open .chevron {
  color: $blue;
}

.weight {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 500;
}

.detail {
  padding: 10px 14px 14px 14px;
  background: $surface-2;
  animation: expand-in 0.18s ease;
}

.detail-label {
  margin: 0 0 4px;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $muted;
}

.detail-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: $text;
  white-space: pre-line;
}

@keyframes expand-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-btn {
  color: $muted !important;
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

.menu-list {
  background: $surface-2 !important;
  border: 1px solid $stroke;
}

.danger {
  color: $red !important;
  :deep(.v-icon) {
    color: $red !important;
  }
}

.btn-ghost {
  border-color: $stroke !important;
  color: $muted !important;
  text-transform: none;
}

.btn-gradient {
  min-width: 96px;
  height: 40px;
  padding: 0 22px;
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

.dlg-card {
  background: $surface !important;
  border: 1px solid $stroke;
  border-radius: $radius !important;
}

.dlg-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
}
.dlg-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weight-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.weight-field {
  flex: 1;
  min-width: 0;
}

.unit-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  flex-shrink: 0;
  width: 96px;
  padding-top: 2px;
}

.unit-btn {
  height: 40px;
  border: 1px solid $stroke;
  border-radius: $radius-btn;
  background: $surface-2;
  color: $muted;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    background 0.15s;

  &.active {
    border-color: $blue;
    color: $text;
    background: rgba($blue, 0.12);
  }

  &:hover:not(.active) {
    color: $text;
  }
}

.dlg-actions {
  padding: 8px 16px 16px;
  gap: 8px;
  justify-content: flex-end;
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
</style>
