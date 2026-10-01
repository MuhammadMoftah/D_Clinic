<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  value?: string | number
  change?: number
  changeLabel?: string
  description?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  title: '',
  value: '—',
  change: 0,
  changeLabel: 'vs last period',
  description: '',
  variant: 'primary',
  loading: false,
})

const colorMap: Record<string, { icon: string; bg: string; glow: string }> = {
  primary: { icon: '#28B9FF', bg: 'rgba(40,185,255,0.10)', glow: 'rgba(40,185,255,0.15)' },
  success: { icon: '#35D39A', bg: 'rgba(53,211,154,0.10)', glow: 'rgba(53,211,154,0.12)' },
  warning: { icon: '#FFCA63', bg: 'rgba(255,202,99,0.10)',  glow: 'rgba(255,202,99,0.12)' },
  danger:  { icon: '#FF667A', bg: 'rgba(255,102,122,0.10)', glow: 'rgba(255,102,122,0.12)' },
  info:    { icon: '#4DB8FF', bg: 'rgba(77,184,255,0.10)',  glow: 'rgba(77,184,255,0.12)' },
}

const isPositive = computed(() => props.change > 0)
const isNegative = computed(() => props.change < 0)
</script>

<template>
  <div class="stat-card glass-card">
    <!-- Header -->
    <div class="stat-header">
      <!-- Icon -->
      <div
        v-if="icon"
        class="stat-icon"
        :style="{ background: colorMap[variant].bg, color: colorMap[variant].icon, boxShadow: `0 0 20px ${colorMap[variant].glow}` }"
        v-html="icon"
      />
      <div class="stat-meta">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div class="skeleton" style="height:12px; width:80px; margin-bottom:8px;" />
          <div class="skeleton" style="height:28px; width:120px;" />
        </template>
        <template v-else>
          <p class="stat-title">{{ title }}</p>
          <p class="stat-value" :style="{ color: colorMap[variant].icon }">{{ value }}</p>
        </template>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="!loading && (change !== 0 || description)" class="stat-footer">
      <span v-if="change !== 0" class="stat-change" :class="isPositive ? 'change-up' : isNegative ? 'change-down' : ''">
        <span class="change-icon">{{ isPositive ? '↑' : isNegative ? '↓' : '→' }}</span>
        {{ Math.abs(change) }}%
        <span class="change-label">{{ changeLabel }}</span>
      </span>
      <span v-if="description" class="stat-description">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.stat-header { display: flex; align-items: flex-start; gap: 1rem; }
.stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-meta { flex: 1; min-width: 0; }
.stat-title {
  font-size: 0.8125rem;
  color: #8FA3B8;
  margin-bottom: 0.375rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(100,190,255,0.08);
}
.stat-change { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; font-weight: 500; }
.change-up   { color: #35D39A; }
.change-down { color: #FF667A; }
.change-icon { font-size: 0.85em; }
.change-label { color: #5D7187; font-weight: 400; }
.stat-description { font-size: 0.8rem; color: #5D7187; }
</style>
