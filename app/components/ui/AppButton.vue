<script setup lang="ts">
// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  iconLeft?: string
  iconRight?: string
  iconOnly?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  iconOnly: false,
  block: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

// ─── Styles ──────────────────────────────────────────────────────────────────
const variantClasses: Record<string, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  success:   'btn-success',
  warning:   'btn-warning',
  link:      'btn-link',
}

const sizeClasses: Record<string, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
}

const isDisabled = computed(() => props.disabled || props.loading)

function handleClick(e: MouseEvent) {
  if (!isDisabled.value) emit('click', e)
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    class="btn focus-ring"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      block ? 'w-full' : '',
      iconOnly ? 'btn-icon-only' : '',
    ]"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="btn-spinner" aria-hidden="true">
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </span>

    <!-- Icon left -->
    <span v-if="iconLeft && !loading" class="btn-icon" aria-hidden="true" v-html="iconLeft" />

    <!-- Slot -->
    <span v-if="!iconOnly" class="btn-label">
      <slot />
    </span>
    <span v-else-if="!loading" class="sr-only"><slot /></span>

    <!-- Icon right -->
    <span v-if="iconRight && !iconOnly" class="btn-icon" aria-hidden="true" v-html="iconRight" />
  </button>
</template>

<style scoped>
/* ── Base ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, opacity 150ms ease, transform 150ms ease;
  text-decoration: none;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.btn:active:not(:disabled) { transform: scale(0.97); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Sizes ── */
.btn-xs { height: 1.75rem; padding: 0 0.625rem; font-size: 0.75rem; border-radius: 8px; }
.btn-sm { height: 2rem;    padding: 0 0.875rem; font-size: 0.8125rem; border-radius: 10px; }
.btn-md { height: 2.375rem; padding: 0 1.125rem; font-size: 0.875rem; border-radius: 10px; }
.btn-lg { height: 2.75rem; padding: 0 1.375rem; font-size: 0.9375rem; border-radius: 12px; }
.btn-xl { height: 3.25rem; padding: 0 1.75rem;  font-size: 1rem;      border-radius: 12px; }

/* ── Icon only ── */
.btn-icon-only.btn-xs { width: 1.75rem; padding: 0; }
.btn-icon-only.btn-sm { width: 2rem;    padding: 0; }
.btn-icon-only.btn-md { width: 2.375rem; padding: 0; }
.btn-icon-only.btn-lg { width: 2.75rem; padding: 0; }
.btn-icon-only.btn-xl { width: 3.25rem; padding: 0; }

/* ── Variants ── */
.btn-primary {
  background: linear-gradient(135deg, #1688D4 0%, #28B9FF 100%);
  color: #050B14;
  font-weight: 600;
  border-color: transparent;
  box-shadow: 0 0 24px rgba(40, 185, 255, 0.15);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #28B9FF 0%, #58D6FF 100%);
  box-shadow: 0 0 30px rgba(40, 185, 255, 0.28);
}

.btn-secondary {
  background: rgba(9, 24, 39, 0.72);
  color: #F4F8FC;
  border-color: rgba(100, 190, 255, 0.14);
  backdrop-filter: blur(12px);
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(16, 38, 60, 0.85);
  border-color: rgba(100, 190, 255, 0.30);
  box-shadow: 0 0 18px rgba(40, 185, 255, 0.08);
}

.btn-outline {
  background: transparent;
  color: #28B9FF;
  border-color: rgba(40, 185, 255, 0.40);
}
.btn-outline:hover:not(:disabled) {
  background: rgba(40, 185, 255, 0.08);
  border-color: #28B9FF;
  box-shadow: 0 0 18px rgba(40, 185, 255, 0.12);
}

.btn-ghost {
  background: transparent;
  color: #8FA3B8;
  border-color: transparent;
}
.btn-ghost:hover:not(:disabled) {
  background: rgba(100, 190, 255, 0.06);
  color: #F4F8FC;
}

.btn-danger {
  background: linear-gradient(135deg, #c0384a 0%, #FF667A 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 0 20px rgba(255, 102, 122, 0.12);
}
.btn-danger:hover:not(:disabled) {
  box-shadow: 0 0 28px rgba(255, 102, 122, 0.25);
}

.btn-success {
  background: linear-gradient(135deg, #1fa372 0%, #35D39A 100%);
  color: #050B14;
  font-weight: 600;
  border-color: transparent;
  box-shadow: 0 0 20px rgba(53, 211, 154, 0.12);
}
.btn-success:hover:not(:disabled) {
  box-shadow: 0 0 28px rgba(53, 211, 154, 0.22);
}

.btn-warning {
  background: linear-gradient(135deg, #c99a2e 0%, #FFCA63 100%);
  color: #050B14;
  font-weight: 600;
  border-color: transparent;
}
.btn-warning:hover:not(:disabled) {
  box-shadow: 0 0 24px rgba(255, 202, 99, 0.22);
}

.btn-link {
  background: transparent;
  color: #28B9FF;
  border-color: transparent;
  padding-left: 0;
  padding-right: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.btn-link:hover:not(:disabled) {
  color: #58D6FF;
}

/* ── Spinner ── */
.btn-spinner { display: flex; align-items: center; }
.animate-spin { animation: spin-local 0.8s linear infinite; }
@keyframes spin-local { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── Icon ── */
.btn-icon { display: flex; align-items: center; line-height: 1; }
</style>
