<script setup lang="ts">
interface Props {
  avatars: Array<{ src?: string; name: string; status?: 'online' | 'busy' | 'away' | 'offline' | null }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  size: 'md',
})

const visible = computed(() => props.avatars.slice(0, props.max))
const overflow = computed(() => Math.max(0, props.avatars.length - props.max))

const overlapMap: Record<string, string> = {
  xs: '-mr-2', sm: '-mr-2.5', md: '-mr-3', lg: '-mr-4', xl: '-mr-5',
}
</script>

<template>
  <div class="avatar-group" :class="overlapMap[size]">
    <AppAvatar
      v-for="(av, i) in visible"
      :key="i"
      :src="av.src"
      :name="av.name"
      :status="av.status"
      :size="size"
      class="avatar-group-item"
    />
    <div v-if="overflow > 0" class="avatar-overflow" :class="`av-${size}`">
      +{{ overflow }}
    </div>
  </div>
</template>

<style scoped>
.avatar-group {
  display: flex;
  align-items: center;
  flex-direction: row;
}
.avatar-group-item {
  position: relative;
  box-shadow: 0 0 0 2px #050B14;
  z-index: 1;
}
.avatar-group-item:hover { z-index: 10; transform: translateY(-2px); transition: transform 150ms ease; }

.avatar-overflow {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 24, 39, 0.85);
  border: 1.5px solid rgba(100, 190, 255, 0.20);
  border-radius: 9999px;
  color: #8FA3B8;
  font-weight: 600;
  font-size: 0.7rem;
  box-shadow: 0 0 0 2px #050B14;
  letter-spacing: -0.01em;
}
.av-xs { width: 24px; height: 24px; font-size: 0.6rem; }
.av-sm { width: 32px; height: 32px; font-size: 0.65rem; }
.av-md { width: 40px; height: 40px; font-size: 0.7rem; }
.av-lg { width: 52px; height: 52px; font-size: 0.75rem; }
.av-xl { width: 64px; height: 64px; font-size: 0.8rem; }
</style>
