<script setup lang="ts">
interface Props {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  size: 80,
  strokeWidth: 6,
  variant: 'primary',
  showLabel: true,
  label: '',
})

const percent = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))

const colors: Record<string, { stroke: string; glow: string }> = {
  primary: { stroke: '#28B9FF', glow: 'rgba(40,185,255,0.25)' },
  success: { stroke: '#35D39A', glow: 'rgba(53,211,154,0.25)' },
  warning: { stroke: '#FFCA63', glow: 'rgba(255,202,99,0.25)' },
  danger:  { stroke: '#FF667A', glow: 'rgba(255,102,122,0.25)' },
}

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashoffset = computed(() => circumference.value * (1 - percent.value / 100))
const cx = computed(() => props.size / 2)
</script>

<template>
  <div class="progress-ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- Track -->
      <circle
        class="ring-track"
        :cx="cx" :cy="cx" :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
        stroke="rgba(100,190,255,0.10)"
      />
      <!-- Fill -->
      <circle
        class="ring-fill"
        :cx="cx" :cy="cx" :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke="colors[variant].stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        transform="rotate(-90)"
        :transform-origin="`${cx} ${cx}`"
        :style="{ filter: `drop-shadow(0 0 4px ${colors[variant].glow})` }"
      />
    </svg>
    <div v-if="showLabel" class="ring-label">
      <span class="ring-value" :style="{ color: colors[variant].stroke }">
        {{ Math.round(percent) }}<span class="ring-unit">%</span>
      </span>
      <span v-if="label" class="ring-desc">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ring-fill { transition: stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1); }
.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
}
.ring-value {
  font-size: 1.1em;
  font-weight: 700;
  line-height: 1;
}
.ring-unit { font-size: 0.6em; font-weight: 600; }
.ring-desc {
  font-size: 0.55em;
  color: #5D7187;
  text-align: center;
  line-height: 1.2;
}
</style>
