<script setup lang="ts">
interface Props {
  modelValue?: string | number
  value: string | number
  name: string
  label?: string
  description?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  description: '',
  disabled: false,
  id: '',
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const uid = props.id || `radio-${Math.random().toString(36).slice(2, 8)}`
const isChecked = computed(() => props.modelValue === props.value)
</script>

<template>
  <label :for="uid" class="radio-root" :class="disabled ? 'radio-disabled' : ''">
    <div class="radio-box-wrap">
      <input
        :id="uid"
        type="radio"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        class="radio-input sr-only"
        @change="emit('update:modelValue', value)"
      />
      <div class="radio-circle" :class="isChecked ? 'radio-checked' : 'radio-unchecked'">
        <div v-if="isChecked" class="radio-dot" />
      </div>
    </div>
    <div v-if="label || description" class="radio-text">
      <span v-if="label" class="radio-label">{{ label }}</span>
      <span v-if="description" class="radio-desc">{{ description }}</span>
    </div>
  </label>
</template>

<style scoped>
.radio-root { display: inline-flex; align-items: flex-start; gap: 0.625rem; cursor: pointer; }
.radio-disabled { opacity: 0.5; cursor: not-allowed; }
.radio-box-wrap { flex-shrink: 0; padding-top: 2px; }
.radio-circle {
  width: 18px; height: 18px;
  border-radius: 9999px;
  border: 1.5px solid rgba(100,190,255,0.30);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.radio-unchecked { background: rgba(9,24,39,0.72); }
.radio-checked {
  border-color: #28B9FF;
  box-shadow: 0 0 10px rgba(40,185,255,0.20);
  background: rgba(40,185,255,0.10);
}
.radio-dot { width: 8px; height: 8px; border-radius: 9999px; background: #28B9FF; box-shadow: 0 0 6px rgba(40,185,255,0.50); }
.radio-text { display: flex; flex-direction: column; gap: 0.1rem; }
.radio-label { font-size: 0.875rem; font-weight: 500; color: #F4F8FC; }
.radio-desc  { font-size: 0.75rem; color: #5D7187; }
</style>
