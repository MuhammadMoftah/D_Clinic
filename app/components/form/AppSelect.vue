<script setup lang="ts">
interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | null
  options: Option[]
  label?: string
  placeholder?: string
  helper?: string
  error?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: 'Select an option',
  helper: '',
  error: '',
  required: false,
  disabled: false,
  loading: false,
  id: '',
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>()
const uid = props.id || `select-${Math.random().toString(36).slice(2, 8)}`
const hasError = computed(() => !!props.error)
</script>

<template>
  <div class="field">
    <label v-if="label" :for="uid" class="field-label">
      {{ label }}<span v-if="required" class="field-required">*</span>
    </label>

    <div class="select-wrap" :class="[hasError ? 'wrap-error' : '', disabled || loading ? 'wrap-disabled' : '']">
      <select
        :id="uid"
        :value="modelValue ?? ''"
        :required="required"
        :disabled="disabled || loading"
        :aria-required="required"
        :aria-invalid="hasError"
        class="select focus-ring"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled :selected="!modelValue">{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >{{ opt.label }}</option>
      </select>

      <!-- Chevron icon -->
      <span class="select-chevron" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </span>

      <!-- Loading -->
      <span v-if="loading" class="select-loading">
        <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#28B9FF" stroke-width="3" class="opacity-25"/>
          <path fill="#28B9FF" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </span>
    </div>

    <p v-if="error || helper" class="field-hint" :class="hasError ? 'hint-error' : 'hint-helper'">
      {{ error || helper }}
    </p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 500; color: #8FA3B8; }
.field-required { color: #FF667A; margin-left: 2px; }

.select-wrap {
  position: relative;
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 10px;
  background: rgba(9, 24, 39, 0.72);
  backdrop-filter: blur(12px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.select-wrap:focus-within {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40,185,255,0.18), 0 0 16px rgba(40,185,255,0.10);
}
.wrap-error   { border-color: rgba(255,102,122,0.45) !important; }
.wrap-disabled { opacity: 0.5; }

.select {
  width: 100%;
  height: 2.375rem;
  padding: 0 2.5rem 0 0.875rem;
  background: transparent;
  border: none;
  outline: none;
  color: #F4F8FC;
  font-size: 0.875rem;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
}
.select option {
  background: #081321;
  color: #F4F8FC;
}

.select-chevron {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5D7187;
  pointer-events: none;
  display: flex;
}
.select-loading {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.spin { animation: spin-s 0.8s linear infinite; }
@keyframes spin-s { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.field-hint  { font-size: 0.75rem; }
.hint-helper { color: #5D7187; }
.hint-error  { color: #FF667A; }
</style>
