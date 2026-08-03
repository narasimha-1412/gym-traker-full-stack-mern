<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { useLoaderStore } from '@/stores/loader.store'

const loader = useLoaderStore()

const icons = ['mdi-dumbbell', 'mdi-weight-lifter', 'mdi-kettlebell']

const index = ref(0)
let timer

function startCycle() {
  stopCycle()
  index.value = 0
  timer = setInterval(() => {
    index.value = (index.value + 1) % icons.length
  }, 900)
}

function stopCycle() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

watch(
  () => loader.active,
  active => {
    if (active) startCycle()
    else stopCycle()
  },
  { immediate: true }
)

onUnmounted(stopCycle)
</script>

<template>
  <div
    v-if="loader.active"
    class="app-loader"
    role="status"
    aria-live="polite"
    aria-label="Loading"
  >
    <div class="backdrop" />
    <div class="stage">
      <div class="pulse" aria-hidden="true" />
      <div class="icon-wrap">
        <Transition name="equip" mode="out-in">
          <v-icon :key="icons[index]" :icon="icons[index]" size="36" class="equip-icon" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  pointer-events: all;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba($bg, 0.72);
  backdrop-filter: blur(4px);
}

.stage {
  position: relative;
  z-index: 1;
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    linear-gradient($surface, $surface) padding-box,
    $gradient border-box;
  border: 2px solid transparent;
  overflow: hidden;
}

.pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($blue, 0.35) 0%, rgba($blue, 0.08) 55%, transparent 70%);
  animation: pulse-ring 1.6s ease-in-out infinite;
}

.icon-wrap {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
}

.equip-icon {
  color: $text !important;
  filter: drop-shadow(0 0 10px rgba($blue, 0.35));
}

.equip-enter-active,
.equip-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.equip-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(6px);
}

.equip-leave-to {
  opacity: 0;
  transform: scale(0.7) translateY(-6px);
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(0.88);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.12);
    opacity: 1;
  }
}
</style>
