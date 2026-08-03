<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResetStore } from '@/stores/reset.store'

const route = useRoute()
const reset = useResetStore()

function syncToken() {
  reset.setToken(route.params.token)
}

onMounted(syncToken)
watch(() => route.params.token, syncToken)
</script>

<template>
  <div class="reset-view">
    <div class="blob blue" />
    <div class="blob red" />

    <v-card class="reset-card" elevation="0">
      <div class="brand">
        <div class="mark">
          <v-icon icon="mdi-dumbbell" size="28" class="mark-icon" />
        </div>
        <h1 class="wordmark">IRON<span>LOG</span></h1>
      </div>

      <p class="heading">Set new password</p>
      <p class="sub">Choose a strong password so you can get back to logging sessions.</p>

      <div class="fields">
        <v-text-field
          v-model="reset.password"
          label="New password"
          :type="reset.showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="reset.showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          rounded="lg"
          hide-details="auto"
          @click:append-inner="reset.toggleShowPassword()"
          @keyup.enter="reset.submit()"
        />
        <v-text-field
          v-model="reset.confirm"
          label="Confirm password"
          :type="reset.showConfirm ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="reset.showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          rounded="lg"
          hide-details="auto"
          @click:append-inner="reset.toggleShowConfirm()"
          @keyup.enter="reset.submit()"
        />
      </div>

      <button class="btn-gradient" type="button" @click="reset.submit()">
        Update password
        <v-icon icon="mdi-check" size="18" class="btn-icon" />
      </button>

      <button class="btn-ghost" type="button" @click="reset.goLogin()">
        <v-icon icon="mdi-arrow-left" size="18" class="back-icon" />
        Back to login
      </button>
    </v-card>
  </div>
</template>

<style scoped lang="scss">
.reset-view {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
  background: $bg;
}

.blob {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: drift 8s ease-in-out infinite alternate;

  &.blue {
    top: -60px;
    left: -40px;
    background: rgba($blue, 0.35);
  }
  &.red {
    bottom: -80px;
    right: -40px;
    background: rgba($red, 0.28);
    animation-delay: -3s;
  }
}

@keyframes drift {
  to {
    transform: translate(20px, 16px) scale(1.08);
  }
}

.reset-card {
  width: 100%;
  max-width: 400px;
  padding: 28px 22px 24px;
  background: $surface !important;
  border: 1px solid $stroke;
  border-radius: $radius !important;
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.mark {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $gradient;
  display: grid;
  place-items: center;
  animation: pulse 2.4s ease-in-out infinite;
}

.mark-icon {
  color: #fff;
  animation: swing 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba($blue, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba($blue, 0);
  }
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

.wordmark {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: $text;

  span {
    background: $gradient;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

.heading {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: $text;
}

.sub {
  margin: 8px 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: $muted;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0 16px;
}

.btn-gradient {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: none;
  border-radius: $radius-btn;
  background: $gradient;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
  &:hover {
    filter: brightness(1.08);
    .btn-icon {
      transform: translateX(4px);
    }
  }
}

.btn-icon {
  transition: transform 0.2s ease;
}

.btn-ghost {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  margin-top: 10px;
  border: 1px solid $stroke;
  border-radius: $radius-btn;
  background: transparent;
  color: $muted;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s,
    background 0.15s;

  &:hover {
    color: $text;
    border-color: $muted;
    background: $surface-2;

    .back-icon {
      transform: translateX(-3px);
    }
  }
}

.back-icon {
  transition: transform 0.2s ease;
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
:deep(.v-field__outline) {
  --v-field-border-opacity: 0.6;
}
</style>
