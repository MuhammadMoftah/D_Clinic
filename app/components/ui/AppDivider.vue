<script setup lang="ts">
interface Props {
  label?: string
  vertical?: boolean
  spacing?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  label: '',
  vertical: false,
  spacing: 'md',
})

const spacingMap = { sm: '0.5rem', md: '1rem', lg: '1.5rem' }
</script>

<template>
  <div
    class="divider-root"
    :class="vertical ? 'divider-vertical-root' : 'divider-horizontal-root'"
    :style="vertical ? { marginInline: spacingMap[spacing] } : { marginBlock: spacingMap[spacing] }"
    role="separator"
  >
    <template v-if="!vertical && label">
      <div class="divider-line" />
      <span class="divider-label">{{ label }}</span>
      <div class="divider-line" />
    </template>
    <template v-else-if="!vertical">
      <div class="divider-line-full" />
    </template>
    <template v-else>
      <div class="divider-vertical-line" />
    </template>
  </div>
</template>

<style scoped>
.divider-horizontal-root { display: flex; align-items: center; gap: 0.75rem; width: 100%; }
.divider-vertical-root   { display: flex; flex-direction: column; align-items: center; }
.divider-line      { flex: 1; height: 1px; background: rgba(100,190,255,0.14); }
.divider-line-full { width: 100%; height: 1px; background: rgba(100,190,255,0.14); }
.divider-label { font-size: 0.75rem; color: #5D7187; white-space: nowrap; flex-shrink: 0; }
.divider-vertical-line { width: 1px; height: 100%; background: rgba(100,190,255,0.14); }
</style>
