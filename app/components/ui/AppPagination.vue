<script setup lang="ts">
interface Props {
  modelValue: number
  total: number
  perPage?: number
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 10,
  siblingCount: 1,
})

const emit = defineEmits<{ 'update:modelValue': [page: number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))

function go(page: number) {
  if (page >= 1 && page <= totalPages.value) emit('update:modelValue', page)
}

// Generate page numbers with ellipsis
const pages = computed(() => {
  const tp = totalPages.value
  const cur = props.modelValue
  const sb = props.siblingCount

  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)

  const left  = Math.max(2, cur - sb)
  const right = Math.min(tp - 1, cur + sb)

  const result: (number | '...')[] = [1]
  if (left > 2) result.push('...')
  for (let i = left; i <= right; i++) result.push(i)
  if (right < tp - 1) result.push('...')
  result.push(tp)
  return result
})
</script>

<template>
  <nav class="pagination" aria-label="Pagination">
    <!-- Prev -->
    <button
      class="page-btn focus-ring"
      :disabled="modelValue === 1"
      aria-label="Previous page"
      @click="go(modelValue - 1)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <!-- Pages -->
    <template v-for="(page, i) in pages" :key="i">
      <span v-if="page === '...'" class="page-ellipsis">…</span>
      <button
        v-else
        class="page-btn focus-ring"
        :class="page === modelValue ? 'page-active' : ''"
        :aria-label="`Page ${page}`"
        :aria-current="page === modelValue ? 'page' : undefined"
        @click="go(Number(page))"
      >{{ page }}</button>
    </template>

    <!-- Next -->
    <button
      class="page-btn focus-ring"
      :disabled="modelValue === totalPages"
      aria-label="Next page"
      @click="go(modelValue + 1)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </nav>
</template>

<style scoped>
.pagination { display: flex; align-items: center; gap: 0.25rem; }

.page-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #8FA3B8;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 150ms ease;
}
.page-btn:hover:not(:disabled) {
  background: rgba(100,190,255,0.08);
  color: #F4F8FC;
  border-color: rgba(100,190,255,0.14);
}
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-active {
  background: rgba(40,185,255,0.12) !important;
  color: #28B9FF !important;
  border-color: rgba(40,185,255,0.30) !important;
  font-weight: 600;
}
.page-ellipsis { color: #5D7187; width: 2rem; text-align: center; }
</style>
