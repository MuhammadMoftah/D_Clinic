<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closeOnBackdrop: true,
  showClose: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdropClick() {
  if (props.closeOnBackdrop) close()
}

// Trap focus & keyboard
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// Lock scroll
watch(() => props.modelValue, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
}, { immediate: true })

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

const sizeClasses: Record<string, string> = {
  sm:   'modal-sm',
  md:   'modal-md',
  lg:   'modal-lg',
  xl:   'modal-xl',
  full: 'modal-full',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        role="dialog"
        :aria-modal="true"
        :aria-label="title || 'Dialog'"
        tabindex="-1"
        @keydown="onKeydown"
        @click.self="onBackdropClick"
      >
        <!-- Backdrop -->
        <div class="modal-backdrop-layer" @click="onBackdropClick" />

        <!-- Panel -->
        <div
          class="modal-panel"
          :class="sizeClasses[size]"
          role="document"
        >
          <!-- Header -->
          <div v-if="title || $slots.header || showClose" class="modal-header">
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
            <button v-if="showClose" class="modal-close focus-ring" aria-label="Close modal" @click="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal-backdrop-layer {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 15, 0.80);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.modal-panel {
  position: relative;
  z-index: 1;
  background: rgba(9, 24, 39, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(100, 190, 255, 0.18);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 40px rgba(40,185,255,0.08);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 3rem);
  overflow: hidden;
}
.modal-sm   { width: 100%; max-width: 420px; }
.modal-md   { width: 100%; max-width: 560px; }
.modal-lg   { width: 100%; max-width: 760px; }
.modal-xl   { width: 100%; max-width: 1000px; }
.modal-full { width: 100%; max-width: calc(100vw - 3rem); height: calc(100vh - 3rem); }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(100, 190, 255, 0.10);
  flex-shrink: 0;
}
.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: #F4F8FC;
  margin: 0;
}
.modal-close {
  display: flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8FA3B8;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
  flex-shrink: 0;
}
.modal-close:hover { color: #F4F8FC; background: rgba(100,190,255,0.08); }
.modal-body   { padding: 1.5rem; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(100, 190, 255, 0.10);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Transition */
.modal-enter-active { transition: opacity 200ms ease; }
.modal-leave-active { transition: opacity 180ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-panel { animation: modal-panel-in 220ms ease both; }
.modal-leave-active .modal-panel  { animation: modal-panel-out 180ms ease both; }
@keyframes modal-panel-in  { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes modal-panel-out { from { opacity: 1; transform: scale(1); }  to { opacity: 0; transform: scale(0.95); } }
</style>
