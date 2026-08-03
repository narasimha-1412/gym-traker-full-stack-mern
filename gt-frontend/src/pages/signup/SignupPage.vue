<script setup>
import { useSignupStore } from '@/stores/signup.store'

const signup = useSignupStore()
</script>

<template>
  <div class="signup-view">
    <div class="blob blue" />
    <div class="blob red" />

    <div class="layout">
      <section class="benefits">
        <p class="eyebrow">Why IronLog</p>
        <h2 class="benefits-title">Train with clarity</h2>
        <p class="benefits-sub">
          A focused gym tracker for routines, weights, and workout progress — built for the phone in
          your pocket.
        </p>
        <ul class="benefit-list">
          <li v-for="b in signup.benefits" :key="b.title" class="benefit">
            <div class="benefit-icon">
              <v-icon :icon="b.icon" size="20" />
            </div>
            <div>
              <p class="benefit-name">{{ b.title }}</p>
              <p class="benefit-text">{{ b.text }}</p>
            </div>
          </li>
        </ul>
      </section>

      <v-card class="signup-card" elevation="0">
        <div class="brand">
          <div class="mark">
            <v-icon icon="mdi-dumbbell" size="28" class="mark-icon" />
          </div>
          <h1 class="wordmark">IRON<span>LOG</span></h1>
        </div>

        <p class="heading">Create account</p>
        <p class="sub">Start logging your training today</p>

        <div class="fields">
          <v-text-field
            v-model="signup.username"
            label="Username"
            prepend-inner-icon="mdi-account-outline"
            rounded="lg"
            @keyup.enter="signup.submit()"
          />
          <v-text-field
            v-model="signup.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            rounded="lg"
            @keyup.enter="signup.submit()"
          />
          <v-text-field
            v-model="signup.password"
            label="Password"
            :type="signup.showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="signup.showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            rounded="lg"
            @click:append-inner="signup.toggleShowPassword()"
            @keyup.enter="signup.submit()"
          />
        </div>

        <button class="btn-gradient" type="button" @click="signup.submit()">
          Sign Up
          <v-icon icon="mdi-arrow-right" size="18" class="btn-icon" />
        </button>

        <p class="login-link">
          Already have an account? <a href="#" @click.prevent="signup.goLogin()">Log in</a>
        </p>
      </v-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.signup-view {
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

.layout {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 920px;
  display: grid;
  gap: 20px;

  @media (min-width: 800px) {
    grid-template-columns: 1fr 400px;
    align-items: center;
    gap: 36px;
  }
}

.benefits {
  padding: 8px 4px 0;

  @media (min-width: 800px) {
    padding: 12px 8px;
  }
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $muted;
}

.benefits-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: $text;
}

.benefits-sub {
  margin: 8px 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: $muted;
  max-width: 36ch;
}

.benefit-list {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.benefit {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.benefit-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: $surface;
  border: 1px solid $stroke;
  display: grid;
  place-items: center;
  color: $blue;
}

.benefit-name {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text;
}

.benefit-text {
  margin: 2px 0 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: $muted;
}

.signup-card {
  width: 100%;
  max-width: 400px;
  margin-inline: auto;
  padding: 28px 22px 24px;
  background: $surface !important;
  border: 1px solid $stroke;
  border-radius: $radius !important;

  @media (min-width: 800px) {
    margin-inline: 0;
  }
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

.login-link {
  margin: 18px 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: $muted;

  a {
    color: $blue;
    text-decoration: none;
    font-weight: 600;
  }
}

:deep(.v-field) {
  border-radius: $radius-btn !important;
  background: $surface-2;
}
:deep(.v-field__outline) {
  --v-field-border-opacity: 0.6;
}
</style>
