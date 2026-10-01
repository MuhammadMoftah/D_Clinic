<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'number' | 'tel' | 'url'
  helper?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  prefix?: string
  suffix?: string
  iconLeft?: string
  iconRight?: string
  id?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  type: 'text',
  helper: '',
  error: '',
  success: '',
  required: false,
  disabled: false,
  readonly: false,
  loading: false,
  prefix: '',
  suffix: '',
  iconLeft: '',
  iconRight: '',
  id: '',
  autocomplete: 'off',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const uid = props.id || `input-${Math.random().toString(36).slice(2, 8)}`
const hasError   = computed(() => !!props.error)
const hasSuccess = computed(() => !!props.success && !props.error)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="field">
    <!-- Label -->
    <label v-if="label" :for="uid" class="field-label">
      {{ label }}
      <span v-if="required" class="field-required" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div
      class="input-wrap"
      :class="[
        hasError   ? 'input-wrap-error'   : '',
        hasSuccess ? 'input-wrap-success' : '',
        disabled   ? 'input-wrap-disabled' : '',
      ]"
    >
      <!-- Prefix -->
      <span v-if="prefix" class="input-addon input-prefix">{{ prefix }}</span>

      <!-- Icon Left -->
      <span v-if="iconLeft && !prefix" class="input-icon input-icon-left" v-html="iconLeft" />

      <!-- Input -->
      <input
        :id="uid"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled || loading"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :aria-required="required"
        :aria-invalid="hasError"
        :aria-describedby="helper || error || success ? `${uid}-hint` : undefined"
        class="input focus-ring"
        :class="[
          iconLeft && !prefix  ? 'input-pl-icon'   : '',
          iconRight && !suffix ? 'input-pr-icon'   : '',
          prefix               ? 'input-pl-prefix' : '',
          suffix               ? 'input-pr-suffix' : '',
          loading              ? 'input-loading'   : '',
        ]"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Loading spinner -->
      <span v-if="loading" class="input-icon input-icon-right input-spin">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#28B9FF" stroke-width="3"/>
          <path class="opacity-75" fill="#28B9FF" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </span>

      <!-- Icon Right -->
      <span v-else-if="iconRight && !suffix" class="input-icon input-icon-right" v-html="iconRight" />

      <!-- Suffix -->
      <span v-if="suffix" class="input-addon input-suffix">{{ suffix }}</span>
    </div>

    <!-- Hint / Error / Success -->
    <p
      v-if="error || success || helper"
      :id="`${uid}-hint`"
      class="field-hint"
      :class="hasError ? 'field-hint-error' : hasSuccess ? 'field-hint-success' : 'field-hint-helper'"
    >
      {{ error || success || helper }}
    </p>
  </div>
</template>

<style scoped>
/* ── Field ── */
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #8FA3B8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.field-required { color: #FF667A; }

/* ── Wrapper ── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 10px;
  background: rgba(9, 24, 39, 0.72);
  backdrop-filter: blur(12px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input-wrap:focus-within {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40, 185, 255, 0.18), 0 0 16px rgba(40, 185, 255, 0.10);
}
.input-wrap-error   { border-color: rgba(255, 102, 122, 0.45) !important; }
.input-wrap-error:focus-within { box-shadow: 0 0 0 2px rgba(255,102,122,0.20) !important; }
.input-wrap-success { border-color: rgba(53, 211, 154, 0.40) !important; }
.input-wrap-disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Input ── */
.input {
  flex: 1;
  min-width: 0;
  padding: 0 0.875rem;
  height: 2.375rem;
  background: transparent;
  border: none;
  outline: none;
  color: #F4F8FC;
  font-size: 0.875rem;
  font-family: inherit;
  border-radius: 10px;
}
.input::placeholder { color: #5D7187; }
.input:disabled { cursor: not-allowed; }
.input-pl-icon    { padding-left: 2.375rem; }
.input-pr-icon    { padding-right: 2.375rem; }
.input-pl-prefix  { padding-left: 0.5rem; border-top-left-radius: 0; border-bottom-left-radius: 0; }
.input-pr-suffix  { padding-right: 0.5rem; border-top-right-radius: 0; border-bottom-right-radius: 0; }

/* ── Icons ── */
.input-icon {
  position: absolute;
  top: 50%; transform: translateY(-50%);
  display: flex; align-items: center; justify-content: center;
  color: #5D7187;
  pointer-events: none;
}
.input-icon-left  { left: 0.75rem; }
.input-icon-right { right: 0.75rem; }

/* ── Loading spin ── */
.input-spin { animation: spin-input 0.8s linear infinite; pointer-events: none; }
@keyframes spin-input { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }

/* ── Addons ── */
.input-addon {
  display: flex; align-items: center;
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  color: #5D7187;
  background: rgba(100, 190, 255, 0.05);
  border-color: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}
.input-prefix { border-right: 1px solid rgba(100, 190, 255, 0.14); border-radius: 10px 0 0 10px; }
.input-suffix { border-left:  1px solid rgba(100, 190, 255, 0.14); border-radius: 0 10px 10px 0; }

/* ── Hint ── */
.field-hint { font-size: 0.75rem; line-height: 1.4; }
.field-hint-helper  { color: #5D7187; }
.field-hint-error   { color: #FF667A; }
.field-hint-success { color: #35D39A; }
</style>
