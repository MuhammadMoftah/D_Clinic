<script setup lang="ts">
interface DropdownItem {
  key: string
  label: string
  icon?: string
  variant?: 'default' | 'danger'
  disabled?: boolean
  separator?: boolean
}

interface Props {
  items: DropdownItem[]
  align?: 'left' | 'right'
  trigger?: 'click' | 'hover'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  trigger: 'click',
})

const emit = defineEmits<{ select: [key: string] }>()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function toggle() { open.value = !open.value }
function close()  { open.value = false }

function select(item: DropdownItem) {
  if (!item.disabled) {
    emit('select', item.key)
    close()
  }
}

// Close on outside click
function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) close()
}
onMounted(()  => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="dropdown-root">
    <!-- Trigger -->
    <div class="dropdown-trigger" @click="toggle">
      <slot name="trigger">
        <AppButton variant="secondary" icon-right='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'>
          Options
        </AppButton>
      </slot>
    </div>

    <!-- Menu -->
    <Transition name="dropdown">
      <div
        v-if="open"
        class="dropdown-menu"
        :class="align === 'right' ? 'menu-right' : 'menu-left'"
        role="menu"
      >
        <template v-for="item in items" :key="item.key">
          <div v-if="item.separator" class="dropdown-separator" role="separator" />
          <button
            v-else
            class="dropdown-item"
            :class="[
              item.variant === 'danger' ? 'item-danger' : 'item-default',
              item.disabled ? 'item-disabled' : '',
            ]"
            role="menuitem"
            :disabled="item.disabled"
            @click="select(item)"
          >
            <span v-if="item.icon" class="item-icon" v-html="item.icon" />
            {{ item.label }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-root { position: relative; display: inline-flex; }
.dropdown-trigger { display: inline-flex; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  z-index: 200;
  background: rgba(9, 24, 39, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(100, 190, 255, 0.18);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.50), 0 0 20px rgba(40,185,255,0.06);
  padding: 0.375rem;
  min-width: 180px;
  white-space: nowrap;
}
.menu-left  { left: 0; }
.menu-right { right: 0; }

.dropdown-item {
  display: flex; align-items: center; gap: 0.5rem;
  width: 100%; padding: 0.5rem 0.75rem;
  border: none; background: transparent;
  font-size: 0.875rem; font-family: inherit;
  border-radius: 8px; cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
  text-align: left;
}
.item-default  { color: #F4F8FC; }
.item-default:hover  { background: rgba(100,190,255,0.08); }
.item-danger   { color: #FF667A; }
.item-danger:hover   { background: rgba(255,102,122,0.08); }
.item-disabled { opacity: 0.4; cursor: not-allowed; }
.item-icon { display: flex; }

.dropdown-separator { height: 1px; background: rgba(100,190,255,0.10); margin: 0.25rem 0; }

/* Transition */
.dropdown-enter-active { animation: dd-in 160ms ease both; }
.dropdown-leave-active { animation: dd-out 130ms ease both; }
@keyframes dd-in  { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dd-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: translateY(-4px) scale(0.97); } }
</style>
