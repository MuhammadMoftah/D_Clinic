<script setup lang="ts">
export interface Column<T = any> {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (row: T, col: Column<T>) => any
}

interface Props {
  columns: Column[]
  rows: Record<string, any>[]
  loading?: boolean
  selectable?: boolean
  modelValue?: Record<string, any>[]
  keyField?: string
  emptyTitle?: string
  emptyDescription?: string
  rowClass?: (row: Record<string, any>) => string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  modelValue: () => [],
  keyField: 'id',
  emptyTitle: 'No records found',
  emptyDescription: 'No data to display.',
})

const emit = defineEmits<{
  'update:modelValue': [rows: Record<string, any>[]]
  'row-click': [row: Record<string, any>]
  sort: [key: string, dir: 'asc' | 'desc']
}>()

// Sort
const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(col: Column) {
  if (!col.sortable) return
  if (sortKey.value === col.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = col.key
    sortDir.value = 'asc'
  }
  emit('sort', sortKey.value, sortDir.value)
}

// Selection
const selectedKeys = computed(() => new Set(props.modelValue.map((r) => r[props.keyField])))

function isSelected(row: Record<string, any>) {
  return selectedKeys.value.has(row[props.keyField])
}

function toggleRow(row: Record<string, any>) {
  const key = row[props.keyField]
  const updated = isSelected(row)
    ? props.modelValue.filter((r) => r[props.keyField] !== key)
    : [...props.modelValue, row]
  emit('update:modelValue', updated)
}

const allSelected = computed(() =>
  props.rows.length > 0 && props.rows.every((r) => selectedKeys.value.has(r[props.keyField]))
)
const someSelected = computed(() =>
  props.rows.some((r) => selectedKeys.value.has(r[props.keyField])) && !allSelected.value
)

function toggleAll() {
  emit('update:modelValue', allSelected.value ? [] : [...props.rows])
}

function getCellValue(row: Record<string, any>, col: Column): any {
  return col.key.split('.').reduce((o, k) => o?.[k], row)
}
</script>

<template>
  <div class="dt-root">
    <div class="dt-scroll">
      <table class="dt-table" role="table">
        <thead class="dt-thead">
          <tr>
            <!-- Select all -->
            <th v-if="selectable" class="dt-th dt-th-check">
              <AppCheckbox
                :model-value="allSelected"
                :indeterminate="someSelected"
                @update:model-value="toggleAll"
              />
            </th>
            <!-- Columns -->
            <th
              v-for="col in columns"
              :key="col.key"
              class="dt-th"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
              :class="col.sortable ? 'dt-th-sortable' : ''"
              @click="toggleSort(col)"
            >
              <span class="dt-th-inner">
                {{ col.label }}
                <span v-if="col.sortable" class="dt-sort-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline v-if="sortKey === col.key && sortDir === 'asc'"  points="6 9 12 3 18 9"/>
                    <polyline v-else-if="sortKey === col.key && sortDir === 'desc'" points="6 15 12 21 18 15"/>
                    <template v-else>
                      <polyline points="6 9 12 3 18 9" style="opacity:0.3"/>
                      <polyline points="6 15 12 21 18 15" style="opacity:0.3"/>
                    </template>
                  </svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>

        <!-- Loading skeleton -->
        <tbody v-if="loading">
          <tr v-for="i in 5" :key="i" class="dt-tr">
            <td v-if="selectable" class="dt-td"><AppSkeleton width="18px" height="18px" rounded="5px" /></td>
            <td v-for="col in columns" :key="col.key" class="dt-td">
              <AppSkeleton :height="'14px'" :width="`${60 + Math.random() * 30}%`" />
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="!rows.length">
          <tr>
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="dt-empty-cell">
              <AppEmptyState :title="emptyTitle" :description="emptyDescription" />
            </td>
          </tr>
        </tbody>

        <!-- Rows -->
        <tbody v-else>
          <tr
            v-for="row in rows"
            :key="row[keyField]"
            class="dt-tr row-hover"
            :class="[
              isSelected(row) ? 'dt-tr-selected' : '',
              rowClass ? rowClass(row) : '',
            ]"
            @click="emit('row-click', row)"
          >
            <!-- Checkbox -->
            <td v-if="selectable" class="dt-td dt-td-check" @click.stop>
              <AppCheckbox :model-value="isSelected(row)" @update:model-value="toggleRow(row)" />
            </td>
            <!-- Cells -->
            <td
              v-for="col in columns"
              :key="col.key"
              class="dt-td"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col)" :col="col">
                {{ getCellValue(row, col) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dt-root { width: 100%; }
.dt-scroll { overflow-x: auto; border-radius: 16px; }

.dt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  color: #F4F8FC;
}

/* ── Header ── */
.dt-thead {
  background: rgba(8, 19, 33, 0.90);
  border-bottom: 1px solid rgba(100, 190, 255, 0.14);
}
.dt-th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #5D7187;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  border-bottom: 1px solid rgba(100, 190, 255, 0.10);
}
.dt-th-check { width: 44px; }
.dt-th-sortable { cursor: pointer; user-select: none; }
.dt-th-sortable:hover { color: #8FA3B8; }
.dt-th-inner { display: inline-flex; align-items: center; gap: 0.35rem; }
.dt-sort-icon { display: flex; color: #5D7187; }

/* ── Rows ── */
.dt-tr { border-bottom: 1px solid rgba(100, 190, 255, 0.06); transition: background 150ms ease; cursor: default; }
.dt-tr:last-child { border-bottom: none; }
.dt-tr-selected { background: rgba(40, 185, 255, 0.06) !important; }
.dt-td { padding: 0.875rem 1rem; vertical-align: middle; color: #F4F8FC; }
.dt-td-check { width: 44px; }
.dt-empty-cell { padding: 0; }
</style>
