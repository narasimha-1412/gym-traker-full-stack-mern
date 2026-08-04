<script setup>
import { ref } from 'vue'
import { useLoginStore } from '@/stores/login.store'

const login = useLoginStore()
const showPassword = ref(false)
</script>

<template>
  <div class="login-view">
    <div class="blob blue" />
    <div class="blob red" />

    <v-card class="login-card" elevation="0">
      <div class="brand">
        <div class="mark">
          <v-icon icon="mdi-dumbbell" size="28" class="mark-icon" />
        </div>
        <h1 class="wordmark">IRON<span>LOG</span></h1>
      </div>

      <p class="heading">Welcome back</p>
      <p class="sub">Sign in to track your training</p>

      <div class="fields">
        <v-text-field
          v-model="login.email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          rounded="lg"
          @keyup.enter="login.submit()"
        />
        <v-text-field
          v-model="login.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          rounded="lg"
          @click:append-inner="showPassword = !showPassword"
          @keyup.enter="login.submit()"
        />
      </div>

      <button class="btn-gradient" type="button" @click="login.submit()">
        Log In
        <v-icon icon="mdi-arrow-right" size="18" class="btn-icon" />
      </button>
    </v-card>
  </div>
</template>

<style scoped lang="scss">
.login-view {
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

.login-card {
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
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: $muted;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  margin-bottom: 16px;
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

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
:deep(.v-field__outline) {
  --v-field-border-opacity: 0.6;
}
</style>
