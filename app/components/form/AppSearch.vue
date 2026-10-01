<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  id?: string
  disabled?: boolean
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'Search...',
  id: '',
  disabled: false,
  debounce: 0,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uid = props.id || `search-${Math.random().toString(36).slice(2, 8)}`
const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (v) => { internalValue.value = v })

let timer: ReturnType<typeof setTimeout>
function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  internalValue.value = val
  if (props.debounce > 0) {
    clearTimeout(timer)
    timer = setTimeout(() => emit('update:modelValue', val), props.debounce)
  } else {
    emit('update:modelValue', val)
  }
}

function clear() {
  internalValue.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search-wrap">
    <label v-if="label" :for="uid" class="sr-only">{{ label }}</label>
    <!-- Search icon -->
    <span class="search-icon" aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </span>

    <input
      :id="uid"
      type="search"
      :value="internalValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="label || placeholder"
      class="search-input focus-ring"
      autocomplete="off"
      @input="onInput"
    />

    <!-- Clear -->
    <button
      v-if="internalValue"
      type="button"
      class="search-clear"
      aria-label="Clear search"
      @click="clear"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #5D7187;
  display: flex;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 2.375rem;
  padding: 0 2.5rem 0 2.25rem;
  background: rgba(9, 24, 39, 0.72);
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 10px;
  color: #F4F8FC;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  backdrop-filter: blur(12px);
}
.search-input::placeholder { color: #5D7187; }
.search-input::-webkit-search-cancel-button { display: none; }
.search-input:focus {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40,185,255,0.18), 0 0 16px rgba(40,185,255,0.10);
}
.search-clear {
  position: absolute;
  right: 0.625rem;
  background: transparent;
  border: none;
  color: #5D7187;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 150ms ease;
}
.search-clear:hover { color: #8FA3B8; }
</style>
