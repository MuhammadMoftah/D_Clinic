<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'white'
  label?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  label: 'Loading...',
})

const sizeMap = { sm: 20, md: 32, lg: 48 }
const strokeMap = { sm: 2, md: 3, lg: 3.5 }
</script>

<template>
  <div class="spinner-root" role="status" :aria-label="label">
    <svg
      :width="sizeMap[size]"
      :height="sizeMap[size]"
      :viewBox="`0 0 ${sizeMap[size]} ${sizeMap[size]}`"
      fill="none"
      class="spinner-svg"
    >
      <!-- Track -->
      <circle
        :cx="sizeMap[size]/2"
        :cy="sizeMap[size]/2"
        :r="(sizeMap[size] - strokeMap[size]) / 2"
        :stroke-width="strokeMap[size]"
        stroke="rgba(100,190,255,0.10)"
      />
      <!-- Arc -->
      <circle
        :cx="sizeMap[size]/2"
        :cy="sizeMap[size]/2"
        :r="(sizeMap[size] - strokeMap[size]) / 2"
        :stroke-width="strokeMap[size]"
        :stroke="variant === 'white' ? '#ffffff' : '#28B9FF'"
        stroke-linecap="round"
        :stroke-dasharray="`${(sizeMap[size] - strokeMap[size]) * Math.PI * 0.75} ${(sizeMap[size] - strokeMap[size]) * Math.PI}`"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-root { display: inline-flex; align-items: center; justify-content: center; }
.spinner-svg  { animation: spin-c 0.8s linear infinite; }
@keyframes spin-c { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
