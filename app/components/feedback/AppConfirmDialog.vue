<script setup lang="ts">
interface Props {
  modelValue?: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function confirm() { emit('confirm') }
function cancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

const icons: Record<string, string> = {
  danger:  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
}
const colors: Record<string, { icon: string; bg: string }> = {
  danger:  { icon: '#FF667A', bg: 'rgba(255,102,122,0.10)' },
  warning: { icon: '#FFCA63', bg: 'rgba(255,202,99,0.10)' },
  info:    { icon: '#28B9FF', bg: 'rgba(40,185,255,0.10)' },
}
</script>

<template>
  <AppModal :model-value="modelValue" size="sm" :show-close="false" @update:model-value="cancel">
    <div class="confirm-body">
      <!-- Icon -->
      <div class="confirm-icon" :style="{ background: colors[variant].bg, color: colors[variant].icon }">
        <span v-html="icons[variant]" />
      </div>
      <h3 class="confirm-title">{{ title }}</h3>
      <p class="confirm-message">{{ message }}</p>
    </div>
    <template #footer>
      <AppButton variant="ghost" :disabled="loading" @click="cancel">{{ cancelLabel }}</AppButton>
      <AppButton :variant="variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'" :loading="loading" @click="confirm">
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.confirm-body { text-align: center; padding: 0.5rem 0 0.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.875rem; }
.confirm-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.confirm-title   { font-size: 1rem; font-weight: 600; color: #F4F8FC; }
.confirm-message { font-size: 0.875rem; color: #8FA3B8; line-height: 1.5; }
</style>
