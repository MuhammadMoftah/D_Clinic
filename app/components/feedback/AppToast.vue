<script setup lang="ts">
interface Props {
  id: string | number
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: '',
  duration: 4000,
  dismissible: true,
})

const emit = defineEmits<{ dismiss: [id: string | number] }>()

const visible = ref(true)
const progress = ref(100)

const icons: Record<string, string> = {
  info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
  warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  danger:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
}

const styles: Record<string, { color: string; border: string; progress: string }> = {
  info:    { color: '#28B9FF', border: 'rgba(40,185,255,0.25)',  progress: '#28B9FF' },
  success: { color: '#35D39A', border: 'rgba(53,211,154,0.25)',  progress: '#35D39A' },
  warning: { color: '#FFCA63', border: 'rgba(255,202,99,0.25)',  progress: '#FFCA63' },
  danger:  { color: '#FF667A', border: 'rgba(255,102,122,0.25)', progress: '#FF667A' },
}

function dismiss() {
  visible.value = false
  setTimeout(() => emit('dismiss', props.id), 200)
}

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  if (props.duration > 0) {
    const step = 100 / (props.duration / 50)
    interval = setInterval(() => {
      progress.value -= step
      if (progress.value <= 0) {
        clearInterval(interval)
        dismiss()
      }
    }, 50)
  }
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <Transition name="toast-slide">
    <div
      v-if="visible"
      class="toast"
      :style="{ borderColor: styles[variant].border }"
      role="alert"
      :aria-live="variant === 'danger' ? 'assertive' : 'polite'"
    >
      <!-- Left accent bar -->
      <div class="toast-bar" :style="{ background: styles[variant].color }" />

      <!-- Icon -->
      <span class="toast-icon" :style="{ color: styles[variant].color }" v-html="icons[variant]" />

      <!-- Body -->
      <div class="toast-body">
        <p v-if="title" class="toast-title" :style="{ color: styles[variant].color }">{{ title }}</p>
        <p class="toast-message">{{ message }}</p>
      </div>

      <!-- Close -->
      <button v-if="dismissible" class="toast-close" aria-label="Dismiss" @click="dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Progress bar -->
      <div v-if="duration > 0" class="toast-progress">
        <div
          class="toast-progress-fill"
          :style="{ width: `${progress}%`, background: styles[variant].progress }"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem 1.25rem;
  background: rgba(9, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.45), 0 0 20px rgba(40,185,255,0.05);
  width: 340px;
  max-width: calc(100vw - 2rem);
  overflow: hidden;
}
.toast-bar {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 14px 0 0 14px;
}
.toast-icon { display: flex; flex-shrink: 0; margin-top: 1px; }
.toast-body { flex: 1; min-width: 0; }
.toast-title { font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.2rem; }
.toast-message { font-size: 0.8rem; color: #8FA3B8; line-height: 1.4; }
.toast-close {
  background: transparent; border: none; color: #5D7187; cursor: pointer;
  display: flex; flex-shrink: 0; padding: 2px;
  border-radius: 4px; transition: color 150ms ease;
}
.toast-close:hover { color: #8FA3B8; }

.toast-progress {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: rgba(100,190,255,0.08);
}
.toast-progress-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 50ms linear;
}

/* Transition */
.toast-slide-enter-active { animation: toast-in 250ms ease both; }
.toast-slide-leave-active { animation: toast-out 200ms ease both; }
@keyframes toast-in  { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
@keyframes toast-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(110%); } }
</style>
