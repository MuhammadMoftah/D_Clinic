<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(item, i) in items" :key="i" class="breadcrumb-item">
        <NuxtLink v-if="item.to && i < items.length - 1" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </NuxtLink>
        <span v-else class="breadcrumb-current" :aria-current="i === items.length - 1 ? 'page' : undefined">
          {{ item.label }}
        </span>
        <span v-if="i < items.length - 1" class="breadcrumb-sep" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb { display: flex; }
.breadcrumb-list { display: flex; align-items: center; gap: 0.25rem; list-style: none; flex-wrap: wrap; }
.breadcrumb-item { display: flex; align-items: center; gap: 0.25rem; }
.breadcrumb-link {
  font-size: 0.8125rem; color: #8FA3B8;
  text-decoration: none;
  transition: color 150ms ease;
}
.breadcrumb-link:hover { color: #28B9FF; }
.breadcrumb-current {
  font-size: 0.8125rem;
  color: #F4F8FC;
  font-weight: 500;
}
.breadcrumb-sep { display: flex; color: #5D7187; }
</style>
