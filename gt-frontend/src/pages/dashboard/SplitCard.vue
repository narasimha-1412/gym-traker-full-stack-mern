<script setup>
defineProps({
  split: { type: Object, required: true },
  active: { type: Boolean, default: false },
})
defineEmits(['select', 'edit', 'delete'])
</script>

<template>
  <div
    class="split-card"
    :class="{ active }"
    role="button"
    tabindex="0"
    @click="$emit('select', split.id)"
    @keydown.enter="$emit('select', split.id)"
  >
    <div class="accent" />
    <div class="body" @click.stop>
      <v-checkbox-btn
        :model-value="active"
        true-icon="$radioOn"
        false-icon="$radioOff"
        color="primary"
        density="comfortable"
        @update:model-value="v => v && $emit('select', split.id)"
        @click.stop
      />
    </div>
    <div class="meta">
      <p class="title">{{ split.title }}</p>
      <p class="sub">
        {{ split.routines.length }} routine{{ split.routines.length === 1 ? '' : 's' }}
      </p>
    </div>
    <div class="menu-wrap" @click.stop>
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="text"
            size="small"
            class="menu-btn"
            aria-label="Split actions"
            @click.stop
          >
            <v-icon icon="mdi-dots-vertical" size="20" />
          </v-btn>
        </template>
        <v-list density="compact" class="menu-list">
          <v-list-item
            prepend-icon="mdi-pencil-outline"
            title="Edit"
            @click="$emit('edit', split.id)"
          />
          <v-list-item
            prepend-icon="mdi-delete-outline"
            title="Delete"
            class="danger"
            @click="$emit('delete', split.id)"
          />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<style scoped lang="scss">
.split-card {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  overflow: hidden;
  min-height: 72px;
  padding: 12px 8px 12px 18px;
  background: $surface;
  border: 1px solid $stroke;
  border-radius: $radius;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.98);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-3px);
      border-color: rgba($blue, 0.45);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

      .menu-btn {
        color: $text !important;
      }
    }
  }

  &.active {
    border-color: rgba($blue, 0.55);
    box-shadow: 0 0 0 1px rgba($blue, 0.25);

    .title {
      color: $blue;
    }
  }
}

.accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: $gradient;
  transition: opacity 0.2s;
}

.body {
  flex-shrink: 0;
}

.meta {
  flex: 1;
  min-width: 0;
  padding-left: 4px;
}

.title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: $text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: $muted;
}

.menu-wrap {
  flex-shrink: 0;
}

.menu-btn {
  color: $muted !important;
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
</style>
