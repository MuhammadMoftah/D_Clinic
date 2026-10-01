<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
  indeterminate?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  description: '',
  disabled: false,
  indeterminate: false,
  id: '',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const uid = props.id || `cb-${Math.random().toString(36).slice(2, 8)}`

const checkRef = ref<HTMLInputElement | null>(null)
watch(() => props.indeterminate, (val) => {
  if (checkRef.value) checkRef.value.indeterminate = val
}, { immediate: true })
</script>

<template>
  <label :for="uid" class="cb-root" :class="disabled ? 'cb-disabled' : ''">
    <div class="cb-box-wrap">
      <input
        ref="checkRef"
        :id="uid"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :indeterminate="indeterminate"
        class="cb-input sr-only"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <div class="cb-box" :class="modelValue || indeterminate ? 'cb-checked' : 'cb-unchecked'">
        <svg v-if="modelValue && !indeterminate" width="10" height="10" viewBox="0 0 12 12" fill="none">
          <polyline points="1 6 5 10 11 2" stroke="#050B14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="indeterminate" class="cb-dash" />
      </div>
    </div>
    <div v-if="label || description" class="cb-text">
      <span v-if="label" class="cb-label">{{ label }}</span>
      <span v-if="description" class="cb-desc">{{ description }}</span>
    </div>
  </label>
</template>

<style scoped>
.cb-root {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
}
.cb-disabled { opacity: 0.5; cursor: not-allowed; }
.cb-box-wrap { flex-shrink: 0; padding-top: 1px; }
.cb-box {
  width: 18px; height: 18px;
  border-radius: 5px;
  border: 1.5px solid rgba(100,190,255,0.30);
  display: flex; align-items: center; justify-content: center;
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}
.cb-unchecked { background: rgba(9,24,39,0.72); }
.cb-checked {
  background: linear-gradient(135deg, #1688D4, #28B9FF);
  border-color: transparent;
  box-shadow: 0 0 10px rgba(40,185,255,0.25);
}
.cb-dash { width: 8px; height: 2px; background: #050B14; border-radius: 2px; }
.cb-text { display: flex; flex-direction: column; gap: 0.1rem; }
.cb-label { font-size: 0.875rem; font-weight: 500; color: #F4F8FC; }
.cb-desc  { font-size: 0.75rem; color: #5D7187; }
</style>
