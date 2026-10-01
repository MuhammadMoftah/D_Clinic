<script setup lang="ts">
// Global toast state — usable via useToast() composable
import { useToastStore } from '~/composables/useToast'

const { toasts, dismiss } = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast-group" tag="div" class="toast-stack">
        <AppToast
          v-for="toast in toasts"
          :key="toast.id"
          v-bind="toast"
          @dismiss="dismiss"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  pointer-events: none;
}
.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  align-items: flex-end;
  pointer-events: all;
}

/* TransitionGroup */
.toast-group-move { transition: transform 250ms ease; }
.toast-group-enter-active { transition: all 250ms ease; }
.toast-group-leave-active { transition: all 200ms ease; position: absolute; }
.toast-group-enter-from  { opacity: 0; transform: translateX(100%); }
.toast-group-leave-to    { opacity: 0; transform: translateX(110%); }
</style>
