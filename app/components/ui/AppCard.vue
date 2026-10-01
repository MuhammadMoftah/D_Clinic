<script setup lang="ts">
interface Props {
  variant?: 'default' | 'elevated' | 'interactive' | 'selected' | 'glass' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'md' | 'lg' | 'card' | 'xl'
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  radius: 'card',
  as: 'div',
})

const variantClasses: Record<string, string> = {
  default:     'card-default',
  elevated:    'card-elevated',
  interactive: 'card-interactive',
  selected:    'card-selected',
  glass:       'card-glass',
  bordered:    'card-bordered',
}

const paddingClasses: Record<string, string> = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

const radiusClasses: Record<string, string> = {
  md:   'rounded-[12px]',
  lg:   'rounded-[16px]',
  card: 'rounded-[20px]',
  xl:   'rounded-[24px]',
}
</script>

<template>
  <component
    :is="as"
    class="card"
    :class="[variantClasses[variant], paddingClasses[padding], radiusClasses[radius]]"
  >
    <!-- Header slot -->
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <!-- Default slot -->
    <slot />

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}

/* ── Variants ── */
.card-default {
  background: rgba(9, 24, 39, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(100, 190, 255, 0.14);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
}
.card-elevated {
  background: rgba(9, 24, 39, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(100, 190, 255, 0.18);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 24px rgba(40, 185, 255, 0.08);
}
.card-interactive {
  background: rgba(9, 24, 39, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(100, 190, 255, 0.14);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
  cursor: pointer;
}
.card-interactive:hover {
  border-color: rgba(100, 190, 255, 0.30);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 24px rgba(40, 185, 255, 0.10);
  transform: translateY(-2px);
}
.card-selected {
  background: rgba(40, 185, 255, 0.06);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(40, 185, 255, 0.40);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28), 0 0 30px rgba(40, 185, 255, 0.12);
}
.card-glass {
  background: rgba(9, 24, 39, 0.60);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(100, 190, 255, 0.10);
}
.card-bordered {
  background: #0C1B2B;
  border: 1px solid rgba(100, 190, 255, 0.20);
}

/* ── Slots ── */
.card-header {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(100, 190, 255, 0.10);
}
.card-footer {
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(100, 190, 255, 0.10);
}
</style>
