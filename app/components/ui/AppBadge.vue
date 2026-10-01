<script setup lang="ts">
interface Props {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  pill?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  dot: false,
  pill: true,
})

const variantMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  neutral: { bg: 'rgba(93,113,135,0.15)', text: '#8FA3B8', border: 'rgba(93,113,135,0.30)', dot: '#5D7187' },
  primary: { bg: 'rgba(40,185,255,0.12)', text: '#28B9FF', border: 'rgba(40,185,255,0.30)', dot: '#28B9FF' },
  success: { bg: 'rgba(53,211,154,0.12)', text: '#35D39A', border: 'rgba(53,211,154,0.30)', dot: '#35D39A' },
  warning: { bg: 'rgba(255,202,99,0.12)',  text: '#FFCA63', border: 'rgba(255,202,99,0.30)',  dot: '#FFCA63' },
  danger:  { bg: 'rgba(255,102,122,0.12)', text: '#FF667A', border: 'rgba(255,102,122,0.30)', dot: '#FF667A' },
  info:    { bg: 'rgba(77,184,255,0.12)',  text: '#4DB8FF', border: 'rgba(77,184,255,0.30)',  dot: '#4DB8FF' },
}
</script>

<template>
  <span
    class="badge"
    :class="[
      size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : 'badge-md',
      pill ? 'badge-pill' : 'badge-rounded',
    ]"
    :style="{
      background: variantMap[variant].bg,
      color: variantMap[variant].text,
      borderColor: variantMap[variant].border,
    }"
  >
    <span v-if="dot" class="badge-dot" :style="{ background: variantMap[variant].dot }" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
  border: 1px solid;
  letter-spacing: 0.01em;
  flex-shrink: 0;
  white-space: nowrap;
}
.badge-sm  { height: 1.25rem; padding: 0 0.5rem;   font-size: 0.6875rem; }
.badge-md  { height: 1.5rem;  padding: 0 0.625rem; font-size: 0.75rem; }
.badge-lg  { height: 1.75rem; padding: 0 0.75rem;  font-size: 0.8125rem; }
.badge-pill    { border-radius: 9999px; }
.badge-rounded { border-radius: 6px; }
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  flex-shrink: 0;
}
</style>
