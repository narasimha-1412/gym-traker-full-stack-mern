<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { useSettingsStore } from '@/stores/settings.store'

const app = useAppStore()
const settings = useSettingsStore()

const tab = ref('profile')
const show = ref({ current: false, next: false, confirm: false })
const bulkOpen = ref(false)

onMounted(() => {
  tab.value = 'profile'
  show.value = { current: false, next: false, confirm: false }
  bulkOpen.value = false
  settings.bulkJson = ''
  settings.loadProfile()
  if (app.isAdmin()) settings.loadConfigs()
})

function eyeIcon(key) {
  return show.value[key] ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
}

function toggleShow(key) {
  show.value[key] = !show.value[key]
}

async function updatePassword() {
  if (await settings.changePassword()) {
    show.value = { current: false, next: false, confirm: false }
  }
}

function setConfigField(key, value) {
  const cleaned = String(value ?? '').replace(/\D/g, '')
  settings.configs[key] = cleaned === '' ? '' : Number(cleaned)
}

function openBulk() {
  settings.bulkJson = ''
  bulkOpen.value = true
}

function closeBulk() {
  bulkOpen.value = false
  settings.bulkJson = ''
}

async function submitBulk() {
  if (await settings.submitBulkImport()) closeBulk()
}
</script>

<template>
  <div class="settings">
    <v-app-bar flat class="bar" height="56">
      <v-btn icon variant="text" aria-label="Back" @click="app.goDashboard()">
        <v-icon icon="mdi-arrow-left" class="back-icon" />
      </v-btn>
      <v-toolbar-title class="title">Settings</v-toolbar-title>
      <v-spacer />
      <button class="btn-logout" type="button" @click="settings.logout()">
        <v-icon icon="mdi-logout" size="18" class="logout-icon" />
        Log out
      </button>
    </v-app-bar>

    <div class="content">
      <div class="tabs" :class="{ admin: app.isAdmin() }" role="tablist">
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: tab === 'profile' }"
          :aria-selected="tab === 'profile'"
          @click="tab = 'profile'"
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: tab === 'password' }"
          :aria-selected="tab === 'password'"
          @click="tab = 'password'"
        >
          Change password
        </button>
        <button
          v-if="app.isAdmin()"
          type="button"
          role="tab"
          class="tab"
          :class="{ active: tab === 'configs' }"
          :aria-selected="tab === 'configs'"
          @click="tab = 'configs'"
        >
          Configs
        </button>
      </div>

      <div v-if="tab === 'profile'" class="panel">
        <p class="section">Profile</p>
        <div class="fields">
          <v-text-field
            v-model="settings.profile.name"
            label="Username"
            prepend-inner-icon="mdi-account-outline"
            rounded="lg"
            hide-details="auto"
            @keyup.enter="settings.saveProfile()"
          />
          <v-text-field
            :model-value="settings.profile.email"
            label="Email"
            prepend-inner-icon="mdi-email-outline"
            rounded="lg"
            hide-details="auto"
            disabled
          />
        </div>
        <button class="btn-gradient" type="button" @click="settings.saveProfile()">
          Save profile
        </button>

        <p class="section bulk-section">Plan import</p>
        <p class="hint">Bulk-add splits, workouts, and exercises from JSON.</p>
        <button class="btn-outline" type="button" @click="openBulk()">Bulk add splits</button>
      </div>

      <div v-else-if="tab === 'password'" class="panel">
        <p class="section">Change password</p>
        <div class="fields">
          <v-text-field
            v-model="settings.pw.current"
            label="Current password"
            :type="show.current ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="eyeIcon('current')"
            rounded="lg"
            hide-details="auto"
            @click:append-inner="toggleShow('current')"
          />
          <v-text-field
            v-model="settings.pw.next"
            label="New password"
            :type="show.next ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-plus-outline"
            :append-inner-icon="eyeIcon('next')"
            rounded="lg"
            hide-details="auto"
            @click:append-inner="toggleShow('next')"
          />
          <v-text-field
            v-model="settings.pw.confirm"
            label="Confirm new password"
            :type="show.confirm ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="eyeIcon('confirm')"
            rounded="lg"
            hide-details="auto"
            @click:append-inner="toggleShow('confirm')"
            @keyup.enter="updatePassword()"
          />
        </div>
        <button class="btn-gradient" type="button" @click="updatePassword()">
          Update password
        </button>
      </div>

      <div v-else-if="tab === 'configs' && app.isAdmin()" class="panel">
        <p class="section">Configs</p>
        <p class="hint">
          Applies to all users. Existing items over a lower limit are kept; new ones are blocked.
        </p>
        <div class="fields">
          <v-text-field
            :model-value="settings.configs.maxSplits"
            label="Max splits"
            type="text"
            inputmode="numeric"
            prepend-inner-icon="mdi-view-split-horizontal"
            rounded="lg"
            hide-details="auto"
            hint="1–100"
            persistent-hint
            @update:model-value="setConfigField('maxSplits', $event)"
          />
          <v-text-field
            :model-value="settings.configs.maxWorkoutsPerSplit"
            label="Max workouts per split"
            type="text"
            inputmode="numeric"
            prepend-inner-icon="mdi-dumbbell"
            rounded="lg"
            hide-details="auto"
            hint="1–100"
            persistent-hint
            @update:model-value="setConfigField('maxWorkoutsPerSplit', $event)"
          />
          <v-text-field
            :model-value="settings.configs.maxExercisesPerWorkout"
            label="Max exercises per workout"
            type="text"
            inputmode="numeric"
            prepend-inner-icon="mdi-arm-flex"
            rounded="lg"
            hide-details="auto"
            hint="1–100"
            persistent-hint
            @update:model-value="setConfigField('maxExercisesPerWorkout', $event)"
            @keyup.enter="settings.saveConfigs()"
          />
        </div>
        <button class="btn-gradient" type="button" @click="settings.saveConfigs()">
          Save configs
        </button>
      </div>
    </div>

    <v-dialog
      :model-value="bulkOpen"
      max-width="480"
      content-class="dlg"
      @update:model-value="v => !v && closeBulk()"
    >
      <v-card class="dlg-card">
        <v-card-title class="dlg-title">Bulk add splits</v-card-title>
        <v-card-text class="dlg-body">
          <ol class="steps">
            <li>Copy the example prompt and paste it into any AI chat.</li>
            <li>Replace the notes section with your plan; ask the AI for JSON only.</li>
            <li>Paste that JSON below and submit.</li>
          </ol>
          <p class="hint">
            Split names must be new (case-insensitive). Matching an existing split rejects the whole
            import. Workouts and exercises are created under each new split (duplicate names
            allowed). If any limit would be exceeded, nothing is imported. Active split is not
            changed.
          </p>
          <button class="btn-outline" type="button" @click="settings.copyBulkPrompt()">
            Copy example prompt
          </button>
          <v-textarea
            v-model="settings.bulkJson"
            class="bulk-json"
            label="Paste JSON"
            variant="outlined"
            rows="8"
            no-resize
            rounded="lg"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="dlg-actions">
          <v-btn variant="outlined" class="btn-ghost" @click="closeBulk()">Cancel</v-btn>
          <button class="btn-gradient btn-submit" type="button" @click="submitBulk()">
            Submit
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.settings {
  background: $bg;
}

.bar {
  background: $surface !important;
  border-bottom: 1px solid $stroke;
  padding-inline-end: 12px;
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

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: $radius-btn;
  background: $red;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    filter 0.15s,
    transform 0.15s;

  &:hover {
    filter: brightness(1.1);
    .logout-icon {
      transform: translateX(2px);
    }
  }
  &:active {
    transform: scale(0.97);
  }
}

.logout-icon {
  transition: transform 0.2s ease;
}

.content {
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 14px;
  padding: 4px;
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius-btn;

  &.admin {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.tab {
  height: 38px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: $muted;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &.active {
    background: $surface-2;
    color: $text;
  }

  &:hover:not(.active) {
    color: $text;
  }
}

.panel {
  padding: 20px 16px;
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.section {
  margin: 0 0 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text;
}

.bulk-section {
  margin-top: 22px;
}

.hint {
  margin: -6px 0 14px;
  font-size: 0.82rem;
  line-height: 1.4;
  color: $muted;
}

.btn-gradient {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: $radius-btn;
  background: $gradient;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition:
    filter 0.15s,
    transform 0.15s;
  &:active {
    transform: scale(0.98);
  }
  &:hover {
    filter: brightness(1.08);
  }
}

.btn-outline {
  width: 100%;
  height: 44px;
  border: 1px solid $stroke;
  border-radius: $radius-btn;
  background: $surface-2;
  color: $text;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition:
    filter 0.15s,
    transform 0.15s;
  &:active {
    transform: scale(0.98);
  }
  &:hover {
    filter: brightness(1.05);
  }
}

.btn-submit {
  width: auto;
  min-width: 110px;
  padding: 0 18px;
}

.dlg-card {
  background: $surface !important;
  color: $text;
}

.dlg-title {
  font-family: 'Space Grotesk', sans-serif !important;
  font-weight: 600 !important;
}

.dlg-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.steps {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  line-height: 1.45;
  color: $text;

  li + li {
    margin-top: 4px;
  }
}

.bulk-json {
  margin-top: 4px;

  :deep(textarea.v-field__input) {
    max-height: 180px !important;
    height: 180px !important;
    overflow-y: auto !important;
    resize: none;
  }
}

.dlg-actions {
  padding: 8px 16px 16px !important;
  gap: 8px;
}

.btn-ghost {
  border-color: $stroke !important;
  color: $text !important;
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
</style>
