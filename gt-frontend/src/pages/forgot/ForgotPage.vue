<script setup>
import { useForgotStore } from '@/stores/forgot.store'

const forgot = useForgotStore()
</script>

<template>
  <div class="forgot-view">
    <div class="blob blue" />
    <div class="blob red" />

    <v-card class="forgot-card" elevation="0">
      <div class="brand">
        <div class="mark">
          <v-icon icon="mdi-dumbbell" size="28" class="mark-icon" />
        </div>
        <h1 class="wordmark">IRON<span>LOG</span></h1>
      </div>

      <template v-if="!forgot.sent">
        <p class="heading">Forgot password?</p>
        <p class="sub">
          Enter the email linked to your account. We'll send a reset link so you can get back to
          training.
        </p>

        <div class="fields">
          <v-text-field
            v-model="forgot.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            rounded="lg"
            hide-details="auto"
            @keyup.enter="forgot.submit()"
          />
        </div>

        <button class="btn-gradient" type="button" @click="forgot.submit()">
          Send reset link
          <v-icon icon="mdi-send-outline" size="18" class="btn-icon" />
        </button>

        <button class="btn-ghost" type="button" @click="forgot.goLogin()">
          <v-icon icon="mdi-arrow-left" size="18" class="back-icon" />
          Back to login
        </button>
      </template>

      <template v-else>
        <div class="sent-icon" aria-hidden="true">
          <v-icon icon="mdi-email-check-outline" size="36" />
        </div>
        <p class="heading">Check your inbox</p>
        <p class="sub sent-msg">
          If an account exists for
          <span class="mail">{{ forgot.email }}</span
          >, a reset link is on the way. It may take a minute — check spam if you don't see it.
        </p>
        <p class="hint">Rest up. Your next session starts when you're ready.</p>

        <div class="sent-actions">
          <button class="btn-ghost" type="button" @click="forgot.resend()">
            <v-icon icon="mdi-email-sync-outline" size="18" />
            Resend email
          </button>
          <button class="btn-ghost" type="button" @click="forgot.editEmail()">
            <v-icon icon="mdi-pencil-outline" size="18" />
            Edit email
          </button>
          <button class="btn-gradient" type="button" @click="forgot.goLogin()">
            <v-icon icon="mdi-arrow-left" size="18" class="back-icon" />
            Back to login
          </button>
        </div>

        <p class="link-row">
          Already opened the link?
          <a href="#" @click.prevent="forgot.openResetLink()">Set new password</a>
        </p>
      </template>
    </v-card>
  </div>
</template>

<style scoped lang="scss">
.forgot-view {
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

.forgot-card {
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

.sent-msg .mail {
  color: $text;
  font-weight: 600;
  word-break: break-all;
}

.hint {
  margin: 14px 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: $muted;
  font-style: italic;
}

.sent-icon {
  width: 64px;
  height: 64px;
  margin: 0 0 14px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba($blue, 0.12);
  color: $blue;
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

.sent-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .btn-ghost {
    margin-top: 0;
  }
}

.link-row {
  margin: 16px 0 0;
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
