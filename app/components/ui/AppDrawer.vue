<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  side?: 'right' | 'left'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  side: 'right',
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

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(() => props.modelValue, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

const sizeWidths: Record<string, string> = {
  sm: '320px', md: '480px', lg: '640px', xl: '800px',
}
</script>

<template>
  <Teleport to="body">
    <Transition :name="`drawer-${side}`">
      <div
        v-if="modelValue"
        class="drawer-overlay"
        role="dialog"
        :aria-modal="true"
        :aria-label="title || 'Drawer'"
        @keydown="onKeydown"
      >
        <!-- Backdrop -->
        <div class="drawer-backdrop" @click="closeOnBackdrop && close()" />

        <!-- Panel -->
        <div
          class="drawer-panel"
          :class="side === 'left' ? 'drawer-left' : 'drawer-right'"
          :style="{ maxWidth: sizeWidths[size] }"
        >
          <!-- Header -->
          <div class="drawer-header">
            <slot name="header">
              <h2 class="drawer-title">{{ title }}</h2>
            </slot>
            <button v-if="showClose" class="drawer-close focus-ring" aria-label="Close drawer" @click="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="drawer-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="drawer-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
}
.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 15, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.drawer-panel {
  position: relative;
  z-index: 1;
  width: 100%;
  background: rgba(8, 19, 33, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(100, 190, 255, 0.14);
  box-shadow: 0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(40,185,255,0.06);
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
}
.drawer-right { margin-left: auto; border-right: none; border-radius: 20px 0 0 20px; }
.drawer-left  { margin-right: auto; border-left: none;  border-radius: 0 20px 20px 0; }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(100, 190, 255, 0.10);
  flex-shrink: 0;
}
.drawer-title { font-size: 1rem; font-weight: 600; color: #F4F8FC; margin: 0; }
.drawer-close {
  display: flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; border-radius: 8px;
  border: none; background: transparent; color: #8FA3B8; cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}
.drawer-close:hover { color: #F4F8FC; background: rgba(100,190,255,0.08); }
.drawer-body   { padding: 1.5rem; overflow-y: auto; flex: 1; }
.drawer-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(100, 190, 255, 0.10);
  display: flex; gap: 0.75rem; justify-content: flex-end;
  flex-shrink: 0;
}

/* Right transitions */
.drawer-right-enter-active { transition: opacity 250ms ease; }
.drawer-right-leave-active { transition: opacity 200ms ease; }
.drawer-right-enter-from .drawer-panel,
.drawer-right-enter-from { opacity: 0; }
.drawer-right-enter-active .drawer-panel { animation: drawer-slide-in-right 250ms ease both; }
.drawer-right-leave-active .drawer-panel { animation: drawer-slide-out-right 200ms ease both; }
@keyframes drawer-slide-in-right  { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes drawer-slide-out-right { from { transform: translateX(0); }   to { transform: translateX(100%); } }

/* Left transitions */
.drawer-left-enter-active .drawer-panel { animation: drawer-slide-in-left 250ms ease both; }
.drawer-left-leave-active .drawer-panel { animation: drawer-slide-out-left 200ms ease both; }
@keyframes drawer-slide-in-left  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes drawer-slide-out-left { from { transform: translateX(0); }     to { transform: translateX(-100%); } }
</style>
