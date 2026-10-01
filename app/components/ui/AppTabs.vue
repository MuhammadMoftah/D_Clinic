<script setup lang="ts">
interface Tab {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  badge?: string | number
}

interface Props {
  modelValue: string
  tabs: Tab[]
  variant?: 'pill' | 'underline' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pill',
})

const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

function select(tab: Tab) {
  if (!tab.disabled) emit('update:modelValue', tab.key)
}
</script>

<template>
  <div class="tabs-root">
    <!-- Tab Nav -->
    <div
      class="tabs-nav"
      :class="[`tabs-nav-${variant}`]"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn focus-ring"
        :class="[
          `tab-btn-${variant}`,
          modelValue === tab.key ? `tab-btn-active-${variant}` : 'tab-btn-inactive',
          tab.disabled ? 'tab-btn-disabled' : '',
        ]"
        role="tab"
        :aria-selected="modelValue === tab.key"
        :aria-disabled="tab.disabled"
        :tabindex="tab.disabled ? -1 : 0"
        @click="select(tab)"
      >
        <span v-if="tab.icon" class="tab-icon" v-html="tab.icon" />
        {{ tab.label }}
        <span v-if="tab.badge !== undefined" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div role="tabpanel" class="tab-content">
      <Transition name="tab-fade" mode="out-in">
        <slot :key="modelValue" :active="modelValue" />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.tabs-root { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Pill variant ── */
.tabs-nav-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(9, 24, 39, 0.72);
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 14px;
  padding: 0.25rem;
  overflow-x: auto;
}
.tab-btn-pill {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.875rem;
  border-radius: 10px;
  font-size: 0.875rem; font-weight: 500;
  border: none; cursor: pointer; background: transparent;
  color: #8FA3B8;
  transition: color 150ms ease, background 150ms ease;
  white-space: nowrap;
}
.tab-btn-pill:hover:not(.tab-btn-disabled) { color: #F4F8FC; background: rgba(100,190,255,0.06); }
.tab-btn-active-pill {
  background: rgba(40, 185, 255, 0.12) !important;
  color: #28B9FF !important;
  box-shadow: 0 0 16px rgba(40,185,255,0.12);
  border: 1px solid rgba(40,185,255,0.20) !important;
}

/* ── Underline variant ── */
.tabs-nav-underline {
  display: flex; align-items: center; gap: 0;
  border-bottom: 1px solid rgba(100, 190, 255, 0.14);
  overflow-x: auto;
}
.tab-btn-underline {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem; font-weight: 500;
  border: none; border-bottom: 2px solid transparent;
  cursor: pointer; background: transparent;
  color: #8FA3B8;
  transition: color 150ms ease, border-color 150ms ease;
  white-space: nowrap;
  margin-bottom: -1px;
}
.tab-btn-underline:hover:not(.tab-btn-disabled) { color: #F4F8FC; }
.tab-btn-active-underline { color: #28B9FF !important; border-bottom-color: #28B9FF !important; }

/* ── Card variant ── */
.tabs-nav-card {
  display: flex; align-items: center; gap: 0.5rem;
  overflow-x: auto;
}
.tab-btn-card {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem; font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer; background: transparent;
  color: #8FA3B8;
  transition: all 150ms ease;
  white-space: nowrap;
}
.tab-btn-card:hover:not(.tab-btn-disabled) {
  color: #F4F8FC;
  background: rgba(100,190,255,0.06);
  border-color: rgba(100,190,255,0.14);
}
.tab-btn-active-card {
  background: rgba(9, 24, 39, 0.85) !important;
  color: #28B9FF !important;
  border-color: rgba(40,185,255,0.25) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

/* ── Common ── */
.tab-btn-disabled { opacity: 0.4; cursor: not-allowed; }
.tab-btn-inactive {}

.tab-icon { display: flex; line-height: 1; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(40,185,255,0.15);
  color: #28B9FF;
  border-radius: 9999px;
  font-size: 0.65rem; font-weight: 700;
  padding: 0 0.35rem; min-width: 1.1rem; height: 1.1rem;
}

/* Transition */
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.tab-fade-enter-from { opacity: 0; transform: translateX(6px); }
.tab-fade-leave-to   { opacity: 0; transform: translateX(-6px); }
</style>
