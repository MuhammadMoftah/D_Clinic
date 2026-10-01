<script setup lang="ts">
interface Props {
  value?: number
  max?: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  variant: 'primary',
  size: 'sm',
  showLabel: false,
  label: '',
  animated: true,
})

const percent = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))

const colorMap: Record<string, string> = {
  primary: 'linear-gradient(90deg, #1688D4, #28B9FF)',
  success: 'linear-gradient(90deg, #1fa372, #35D39A)',
  warning: 'linear-gradient(90deg, #c99a2e, #FFCA63)',
  danger:  'linear-gradient(90deg, #c0384a, #FF667A)',
}

const sizeMap: Record<string, string> = {
  xs: '4px', sm: '6px', md: '8px', lg: '12px',
}
</script>

<template>
  <div class="progress-root">
    <div v-if="showLabel || label" class="progress-meta">
      <span class="text-caption">{{ label }}</span>
      <span v-if="showLabel" class="text-caption" style="color: #28B9FF;">{{ Math.round(percent) }}%</span>
    </div>
    <div
      class="progress-track"
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :style="{ height: sizeMap[size] }"
    >
      <div
        class="progress-fill"
        :class="animated ? 'progress-animated' : ''"
        :style="{
          width: `${percent}%`,
          background: colorMap[variant],
          borderRadius: 'inherit',
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.progress-root { display: flex; flex-direction: column; gap: 0.4rem; width: 100%; }
.progress-meta { display: flex; align-items: center; justify-content: space-between; }
.progress-track {
  width: 100%;
  background: rgba(100, 190, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.progress-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
  animation: shimmer-progress 1.8s ease infinite;
}
@keyframes shimmer-progress {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}
</style>
