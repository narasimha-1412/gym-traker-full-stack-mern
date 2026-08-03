<script setup>
defineProps({
  percent: { type: Number, default: 0 },
  size: { type: Number, default: 72 },
})

const r = 30
const c = 2 * Math.PI * r
</script>

<template>
  <div class="progress-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 72 72">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#7c5cf0" />
          <stop offset="100%" stop-color="#ef4444" />
        </linearGradient>
      </defs>
      <circle class="track" cx="36" cy="36" :r="r" />
      <circle
        class="fill"
        cx="36" cy="36" :r="r"
        :stroke-dasharray="c"
        :stroke-dashoffset="c - (percent / 100) * c"
      />
    </svg>
    <span class="pct">{{ percent }}%</span>
  </div>
</template>

<style scoped lang="scss">
.progress-ring {
  position: relative;
  flex-shrink: 0;

  svg { transform: rotate(-90deg); display: block; }

  .track {
    fill: none;
    stroke: $stroke;
    stroke-width: 6;
  }

  .fill {
    fill: none;
    stroke: url(#ringGrad);
    stroke-width: 6;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pct {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    color: $text;
  }
}
</style>
