<script setup lang="ts">
interface TimelineItem {
  id: string | number
  time?: string
  title: string
  description?: string
  icon?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
}

interface Props {
  items: TimelineItem[]
}

defineProps<Props>()

const colorMap: Record<string, { dot: string; glow: string; line: string }> = {
  primary: { dot: '#28B9FF', glow: 'rgba(40,185,255,0.30)', line: 'rgba(40,185,255,0.20)' },
  success: { dot: '#35D39A', glow: 'rgba(53,211,154,0.30)', line: 'rgba(53,211,154,0.20)' },
  warning: { dot: '#FFCA63', glow: 'rgba(255,202,99,0.30)',  line: 'rgba(255,202,99,0.20)' },
  danger:  { dot: '#FF667A', glow: 'rgba(255,102,122,0.30)', line: 'rgba(255,102,122,0.20)' },
  neutral: { dot: '#5D7187', glow: 'transparent',            line: 'rgba(100,190,255,0.12)' },
}
</script>

<template>
  <div class="timeline">
    <div
      v-for="(item, i) in items"
      :key="item.id"
      class="timeline-item"
    >
      <!-- Line + Dot column -->
      <div class="timeline-track">
        <div
          class="timeline-dot"
          :style="{
            background: colorMap[item.variant ?? 'primary'].dot,
            boxShadow: `0 0 8px ${colorMap[item.variant ?? 'primary'].glow}`,
          }"
        >
          <span v-if="item.icon" v-html="item.icon" class="timeline-dot-icon" />
        </div>
        <div
          v-if="i < items.length - 1"
          class="timeline-line"
          :style="{ background: colorMap[item.variant ?? 'primary'].line }"
        />
      </div>

      <!-- Content -->
      <div class="timeline-content">
        <div v-if="item.time" class="timeline-time">{{ item.time }}</div>
        <p class="timeline-title">{{ item.title }}</p>
        <p v-if="item.description" class="timeline-desc">{{ item.description }}</p>
        <slot :name="`item-${item.id}`" :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; gap: 1rem; padding-bottom: 1.25rem; }
.timeline-item:last-child { padding-bottom: 0; }

.timeline-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
}
.timeline-dot {
  width: 16px; height: 16px;
  border-radius: 9999px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(9, 24, 39, 0.80);
}
.timeline-dot-icon { font-size: 8px; line-height: 1; }
.timeline-line { flex: 1; width: 1px; margin-top: 4px; min-height: 16px; }

.timeline-content { flex: 1; min-width: 0; }
.timeline-time {
  font-size: 0.75rem;
  color: #5D7187;
  margin-bottom: 0.2rem;
  font-weight: 500;
}
.timeline-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F4F8FC;
  line-height: 1.4;
}
.timeline-desc {
  font-size: 0.8125rem;
  color: #8FA3B8;
  margin-top: 0.25rem;
  line-height: 1.5;
}
</style>
