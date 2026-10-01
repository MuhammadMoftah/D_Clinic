<script setup lang="ts">
interface Props {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  closable?: boolean
  icon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: '',
  closable: false,
  icon: true,
})

const emit = defineEmits<{ close: [] }>()

const visible = ref(true)

const icons: Record<string, string> = {
  info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  danger:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
}

const styles: Record<string, { bg: string; border: string; color: string }> = {
  info:    { bg: 'rgba(40,185,255,0.08)',  border: 'rgba(40,185,255,0.25)',  color: '#28B9FF' },
  success: { bg: 'rgba(53,211,154,0.08)',  border: 'rgba(53,211,154,0.25)',  color: '#35D39A' },
  warning: { bg: 'rgba(255,202,99,0.08)',  border: 'rgba(255,202,99,0.25)',  color: '#FFCA63' },
  danger:  { bg: 'rgba(255,102,122,0.08)', border: 'rgba(255,102,122,0.25)', color: '#FF667A' },
}

function close() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <Transition name="alert-fade">
    <div
      v-if="visible"
      role="alert"
      class="alert"
      :style="{
        background: styles[variant].bg,
        borderColor: styles[variant].border,
        color: styles[variant].color,
      }"
    >
      <!-- Icon -->
      <span v-if="icon" class="alert-icon" v-html="icons[variant]" />

      <!-- Body -->
      <div class="alert-body">
        <p v-if="title" class="alert-title">{{ title }}</p>
        <div class="alert-message"><slot /></div>
      </div>

      <!-- Close -->
      <button
        v-if="closable"
        class="alert-close focus-ring"
        :style="{ color: styles[variant].color }"
        aria-label="Close alert"
        @click="close"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: fade-in 220ms ease both;
}
@keyframes fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.alert-icon { display: flex; align-items: center; flex-shrink: 0; margin-top: 1px; }
.alert-body { flex: 1; min-width: 0; }
.alert-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.alert-message {
  font-size: 0.8125rem;
  color: #8FA3B8;
  line-height: 1.5;
}
.alert-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 150ms ease, background 150ms ease;
}
.alert-close:hover { opacity: 1; background: rgba(255,255,255,0.08); }

/* Transition */
.alert-fade-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.alert-fade-leave-to    { opacity: 0; transform: translateY(-4px); }
</style>
