<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: string
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  rounded: '8px',
})
</script>

<template>
  <div
    class="skeleton"
    :style="{ width, height, borderRadius: rounded }"
    aria-hidden="true"
  />
</template>
