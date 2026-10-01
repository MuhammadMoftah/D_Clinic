<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  description: '',
  disabled: false,
  id: '',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const uid = props.id || `switch-${Math.random().toString(36).slice(2, 8)}`

function toggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="switch-root" :class="disabled ? 'switch-disabled' : ''">
    <button
      :id="uid"
      role="switch"
      :aria-checked="modelValue"
      :aria-disabled="disabled"
      :disabled="disabled"
      class="switch-track focus-ring"
      :class="modelValue ? 'switch-on' : 'switch-off'"
      @click="toggle"
    >
      <span class="switch-thumb" :class="modelValue ? 'thumb-on' : 'thumb-off'" />
    </button>

    <div v-if="label || description" class="switch-labels" @click="toggle">
      <span v-if="label" class="switch-label">{{ label }}</span>
      <span v-if="description" class="switch-desc">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped>
.switch-root {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.switch-disabled { opacity: 0.5; cursor: not-allowed; }
.switch-labels { display: flex; flex-direction: column; gap: 0.1rem; cursor: pointer; }
.switch-label { font-size: 0.875rem; font-weight: 500; color: #F4F8FC; }
.switch-desc  { font-size: 0.75rem; color: #5D7187; }

.switch-track {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 9999px;
  border: 1px solid rgba(100, 190, 255, 0.20);
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
  flex-shrink: 0;
}
.switch-on {
  background: linear-gradient(135deg, #1688D4, #28B9FF);
  border-color: transparent;
  box-shadow: 0 0 16px rgba(40,185,255,0.25);
}
.switch-off { background: rgba(9, 24, 39, 0.72); }

.switch-thumb {
  position: absolute;
  top: 50%;
  width: 16px; height: 16px;
  border-radius: 9999px;
  background: #F4F8FC;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  transition: transform 200ms ease, left 200ms ease;
  transform: translateY(-50%);
}
.thumb-off { left: 2px; }
.thumb-on  { left: calc(100% - 18px); }
</style>
