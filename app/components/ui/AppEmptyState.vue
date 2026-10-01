<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
}

withDefaults(defineProps<Props>(), {
  icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  title: 'No data found',
  description: 'There are no records to display yet.',
  actionLabel: '',
})

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon" v-html="icon" />
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-desc">{{ description }}</p>
    <slot>
      <AppButton v-if="actionLabel" variant="outline" size="sm" @click="emit('action')">
        {{ actionLabel }}
      </AppButton>
    </slot>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;
}
.empty-icon {
  width: 64px; height: 64px;
  border-radius: 16px;
  background: rgba(100,190,255,0.06);
  border: 1px solid rgba(100,190,255,0.12);
  display: flex; align-items: center; justify-content: center;
  color: #5D7187;
  margin-bottom: 0.25rem;
}
.empty-title { font-size: 0.9375rem; font-weight: 600; color: #F4F8FC; }
.empty-desc  { font-size: 0.8125rem; color: #5D7187; max-width: 280px; line-height: 1.5; }
</style>
