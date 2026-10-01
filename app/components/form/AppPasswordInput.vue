<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  helper?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
  showToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'Enter password',
  helper: '',
  error: '',
  required: false,
  disabled: false,
  id: '',
  showToggle: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uid = props.id || `pw-${Math.random().toString(36).slice(2, 8)}`
const visible = ref(false)
const hasError = computed(() => !!props.error)

const eyeOpen  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
const eyeClosed = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
</script>

<template>
  <div class="field">
    <label v-if="label" :for="uid" class="field-label">
      {{ label }}<span v-if="required" class="field-required">*</span>
    </label>

    <div class="input-wrap" :class="[hasError ? 'wrap-error' : '', disabled ? 'wrap-disabled' : '']">
      <input
        :id="uid"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-required="required"
        :aria-invalid="hasError"
        autocomplete="current-password"
        class="input focus-ring"
        :style="{ paddingRight: showToggle ? '2.5rem' : '0.875rem' }"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="showToggle"
        type="button"
        class="pw-toggle"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        @click="visible = !visible"
        v-html="visible ? eyeClosed : eyeOpen"
      />
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

.input-wrap {
  position: relative;
  border: 1px solid rgba(100,190,255,0.14);
  border-radius: 10px;
  background: rgba(9,24,39,0.72);
  backdrop-filter: blur(12px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input-wrap:focus-within {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40,185,255,0.18), 0 0 16px rgba(40,185,255,0.10);
}
.wrap-error   { border-color: rgba(255,102,122,0.45) !important; }
.wrap-disabled { opacity: 0.5; }

.input {
  display: block;
  width: 100%;
  height: 2.375rem;
  padding: 0 0.875rem;
  background: transparent;
  border: none;
  outline: none;
  color: #F4F8FC;
  font-size: 0.875rem;
  font-family: inherit;
}
.input::placeholder { color: #5D7187; }

.pw-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #5D7187;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 150ms ease;
}
.pw-toggle:hover { color: #8FA3B8; }

.field-hint  { font-size: 0.75rem; }
.hint-helper { color: #5D7187; }
.hint-error  { color: #FF667A; }
</style>
