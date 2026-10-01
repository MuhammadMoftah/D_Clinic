<script setup lang="ts">
interface Props {
  src?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'busy' | 'away' | 'offline' | null
  shape?: 'circle' | 'rounded'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  name: '',
  size: 'md',
  status: null,
  shape: 'circle',
})

const sizeMap: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 52, xl: 64 }
const sizeClasses: Record<string, string> = {
  xs: 'av-xs', sm: 'av-sm', md: 'av-md', lg: 'av-lg', xl: 'av-xl',
}
const statusColors: Record<string, string> = {
  online: '#35D39A', busy: '#FFCA63', away: '#4DB8FF', offline: '#5D7187',
}

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
})

// Generate a deterministic color from name
const bgColor = computed(() => {
  const colors = ['#1688D4', '#327CFF', '#35D39A', '#FFCA63', '#FF667A', '#4DB8FF', '#9B7DFF']
  let hash = 0
  for (const ch of props.name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
})

const showImg = ref(true)
function onImgError() { showImg.value = false }
</script>

<template>
  <div class="avatar-wrap" :class="sizeClasses[size]">
    <div class="avatar" :class="[sizeClasses[size], shape === 'rounded' ? 'avatar-rounded' : 'avatar-circle']">
      <img
        v-if="src && showImg"
        :src="src"
        :alt="name || 'Avatar'"
        class="avatar-img"
        @error="onImgError"
      />
      <span v-else class="avatar-initials" :style="{ background: bgColor, fontSize: `${sizeMap[size] * 0.37}px` }">
        {{ initials }}
      </span>
    </div>

    <!-- Status dot -->
    <span
      v-if="status"
      class="avatar-status"
      :style="{ background: statusColors[status] }"
      :aria-label="`Status: ${status}`"
    />
  </div>
</template>

<style scoped>
.avatar-wrap { position: relative; flex-shrink: 0; display: inline-flex; }
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1.5px solid rgba(100, 190, 255, 0.18);
  flex-shrink: 0;
}
.avatar-circle  { border-radius: 9999px; }
.avatar-rounded { border-radius: 10px; }

.av-xs { width: 24px;  height: 24px; }
.av-sm { width: 32px;  height: 32px; }
.av-md { width: 40px;  height: 40px; }
.av-lg { width: 52px;  height: 52px; }
.av-xl { width: 64px;  height: 64px; }

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; height: 100%;
  color: #050B14;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px; height: 10px;
  border-radius: 9999px;
  border: 2px solid #050B14;
  box-shadow: 0 0 6px currentColor;
}
.av-xs .avatar-status, .av-sm .avatar-status { width: 8px; height: 8px; }
.av-lg .avatar-status { width: 12px; height: 12px; }
.av-xl .avatar-status { width: 14px; height: 14px; }
</style>
