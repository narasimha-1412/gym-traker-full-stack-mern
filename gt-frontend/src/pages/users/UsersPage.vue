<script setup>
import { useAppStore } from '@/stores/app.store'
import { useUsersStore } from '@/stores/users.store'

const app = useAppStore()
const users = useUsersStore()
</script>

<template>
  <div class="users">
    <v-app-bar flat class="bar" height="56">
      <v-btn icon variant="text" aria-label="Back" @click="app.goDashboard()">
        <v-icon icon="mdi-arrow-left" class="back-icon" />
      </v-btn>
      <v-toolbar-title class="title">Users</v-toolbar-title>
    </v-app-bar>

    <div class="content">
      <div class="panel">
        <p class="section">Create user</p>
        <div class="fields">
          <v-text-field
            v-model="users.name"
            label="Name"
            prepend-inner-icon="mdi-account-outline"
            rounded="lg"
            @keyup.enter="users.create()"
          />
          <v-text-field
            v-model="users.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            rounded="lg"
            @keyup.enter="users.create()"
          />
          <v-text-field
            v-model="users.password"
            label="Default password"
            type="text"
            prepend-inner-icon="mdi-lock-outline"
            rounded="lg"
            disabled
          />
        </div>
        <button class="btn-gradient" type="button" @click="users.create()">Create</button>
      </div>

      <div class="panel">
        <p class="section">All users</p>
        <ul class="list">
          <li v-for="u in users.list" :key="u.id" class="row" :class="{ disabled: u.status === 'disabled' }">
            <div class="info">
              <p class="name">
                {{ u.name }}
                <v-icon
                  v-if="u.role === 'admin'"
                  icon="mdi-star"
                  size="16"
                  class="admin-star"
                  aria-label="Admin"
                />
              </p>
              <div class="email-row">
                <p class="email">{{ u.email }}</p>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  aria-label="Copy email"
                  @click="users.copyEmail(u.email)"
                >
                  <v-icon icon="mdi-content-copy" size="16" />
                </v-btn>
              </div>
            </div>
            <button
              v-if="u.role !== 'admin'"
              class="btn-status"
              type="button"
              :class="u.status"
              @click="users.toggleStatus(u.id)"
            >
              {{ u.status === 'active' ? 'Disable' : 'Enable' }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.users {
  min-height: 100dvh;
  background: $bg;
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
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel {
  padding: 20px 16px;
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius;
}

.section {
  margin: 0 0 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
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

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: $surface-2;
  border-radius: $radius-btn;

  &.disabled {
    opacity: 0.65;
  }
}

.info {
  min-width: 0;
}

.name {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: $text;
}

.admin-star {
  color: $blue;
}

.email-row {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
}

.email {
  margin: 0;
  font-size: 0.8rem;
  color: $muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-status {
  flex-shrink: 0;
  height: 28px;
  padding: 0 10px;
  border: 1px solid $stroke;
  border-radius: 8px;
  background: transparent;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: $muted;

  &.active {
    color: $red;
    border-color: rgba($red, 0.4);
  }
  &.disabled {
    color: $blue;
    border-color: rgba($blue, 0.4);
  }
  &:hover {
    filter: brightness(1.1);
  }
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
</style>
