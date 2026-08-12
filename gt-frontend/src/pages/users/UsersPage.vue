<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { useUsersStore } from '@/stores/users.store'

const app = useAppStore()
const users = useUsersStore()

onMounted(() => {
  users.fetchList()
})
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
          <div class="copy-field">
            <v-text-field
              :model-value="users.getGeneratedEmail()"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              rounded="lg"
              disabled
              hide-details
            />
            <v-btn
              icon
              variant="text"
              size="small"
              class="copy-btn"
              aria-label="Copy email"
              @click="users.copyGeneratedEmail()"
            >
              <v-icon icon="mdi-content-copy" size="18" />
            </v-btn>
          </div>
          <div class="copy-field">
            <v-text-field
              v-model="users.password"
              label="Default password"
              type="text"
              prepend-inner-icon="mdi-lock-outline"
              rounded="lg"
              disabled
              hide-details
            />
            <v-btn
              icon
              variant="text"
              size="small"
              class="copy-btn"
              aria-label="Copy default password"
              @click="users.copyDefaultPassword()"
            >
              <v-icon icon="mdi-content-copy" size="18" />
            </v-btn>
          </div>
        </div>
        <button class="btn-gradient" type="button" @click="users.create()">Create</button>
      </div>

      <div class="panel">
        <p class="section">All users</p>
        <v-text-field
          :model-value="users.search"
          label="Search users"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          rounded="lg"
          class="search"
          @update:model-value="users.setSearch($event ?? '')"
          @click:clear="users.clearSearch()"
        />
        <div v-if="users.searching" class="list-loader" aria-live="polite" aria-busy="true">
          <v-progress-circular indeterminate size="28" width="2" color="primary" />
        </div>
        <ul v-else class="list">
          <li v-for="u in users.list" :key="u.id" class="row">
            <div class="info">
              <p class="name">
                {{ u.name }}
                <span
                  v-if="u.status === 'disabled'"
                  class="status-dot"
                  aria-label="Disabled"
                  title="Disabled"
                />
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
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  size="small"
                  class="menu-btn"
                  aria-label="User actions"
                >
                  <v-icon icon="mdi-dots-vertical" />
                </v-btn>
              </template>
              <v-list density="compact" min-width="160">
                <v-list-item
                  title="Reset password"
                  prepend-icon="mdi-lock-reset"
                  @click="users.resetPassword(u.id)"
                />
                <v-list-item
                  v-if="u.role !== 'admin'"
                  :title="u.status === 'active' ? 'Disable' : 'Enable'"
                  :prepend-icon="u.status === 'active' ? 'mdi-account-off' : 'mdi-account-check'"
                  @click="users.toggleStatus(u.id)"
                />
                <v-list-item
                  v-if="u.role !== 'admin'"
                  title="Delete"
                  prepend-icon="mdi-delete-outline"
                  @click="users.deleteUser(u.id)"
                />
              </v-list>
            </v-menu>
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

.copy-field {
  position: relative;

  .copy-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
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

.search {
  margin-bottom: 14px;
}

.list-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  color: $blue;
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
}

.info {
  min-width: 0;
  flex: 1;
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

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $red;
  flex-shrink: 0;
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

.menu-btn {
  flex-shrink: 0;
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
</style>
