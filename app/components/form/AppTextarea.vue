<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  helper?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  rows?: number
  maxlength?: number
  showCount?: boolean
  id?: string
  resize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  helper: '',
  error: '',
  success: '',
  required: false,
  disabled: false,
  readonly: false,
  rows: 4,
  showCount: false,
  id: '',
  resize: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uid = props.id || `textarea-${Math.random().toString(36).slice(2, 8)}`
const hasError   = computed(() => !!props.error)
const hasSuccess = computed(() => !!props.success && !props.error)
const charCount  = computed(() => props.modelValue?.length ?? 0)
</script>

<template>
  <div class="field">
    <div v-if="label" class="field-label-row">
      <label :for="uid" class="field-label">
        {{ label }}<span v-if="required" class="field-required">*</span>
      </label>
      <span v-if="showCount && maxlength" class="char-count">{{ charCount }}/{{ maxlength }}</span>
    </div>

    <div class="input-wrap" :class="[hasError ? 'wrap-error' : hasSuccess ? 'wrap-success' : '', disabled ? 'wrap-disabled' : '']">
      <textarea
        :id="uid"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxlength"
        :aria-required="required"
        :aria-invalid="hasError"
        class="textarea focus-ring"
        :style="{ resize: resize ? 'vertical' : 'none' }"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <p
      v-if="error || success || helper"
      class="field-hint"
      :class="hasError ? 'hint-error' : hasSuccess ? 'hint-success' : 'hint-helper'"
    >
      {{ error || success || helper }}
    </p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label-row { display: flex; align-items: center; justify-content: space-between; }
.field-label { font-size: 0.8125rem; font-weight: 500; color: #8FA3B8; }
.field-required { color: #FF667A; margin-left: 2px; }
.char-count { font-size: 0.75rem; color: #5D7187; }

.input-wrap {
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 10px;
  background: rgba(9, 24, 39, 0.72);
  backdrop-filter: blur(12px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  overflow: hidden;
}
.input-wrap:focus-within {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40,185,255,0.18), 0 0 16px rgba(40,185,255,0.10);
}
.wrap-error   { border-color: rgba(255,102,122,0.45) !important; }
.wrap-success { border-color: rgba(53,211,154,0.40) !important; }
.wrap-disabled { opacity: 0.5; }

.textarea {
  display: block;
  width: 100%;
  padding: 0.75rem 0.875rem;
  background: transparent;
  border: none;
  outline: none;
  color: #F4F8FC;
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.6;
  min-height: 80px;
}
.textarea::placeholder { color: #5D7187; }
.textarea:disabled { cursor: not-allowed; }

.field-hint { font-size: 0.75rem; }
.hint-helper  { color: #5D7187; }
.hint-error   { color: #FF667A; }
.hint-success { color: #35D39A; }
</style>
