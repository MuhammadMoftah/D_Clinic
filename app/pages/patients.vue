<script setup lang="ts">
import { patients as allPatients, formatLastVisit } from '@/data/patients'
import type { Patient, PatientStatus, PatientGender } from '@/data/patients'

useHead({ title: 'Patients — Dr. Dalia Clinic' })

const toast = useToast()

// ── Loading state demo ─────────────────────────────────────────
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 1200) })

// ── In-memory dataset (supports add) ──────────────────────────
const dataset = ref<Patient[]>([...allPatients])

// ── Stats ──────────────────────────────────────────────────────
const stats = computed(() => ({
  total:      dataset.value.length,
  active:     dataset.value.filter(p => p.status === 'Active').length,
  newMonth:   dataset.value.filter(p => p.status === 'New').length,
  followUps:  dataset.value.filter(p => p.status === 'Follow-up').length,
}))

// ── Search & Filters ───────────────────────────────────────────
const search      = ref('')
const filterStatus = ref<PatientStatus | ''>('')
const filterGender = ref<PatientGender | ''>('')
const filterAge    = ref('')
const filterVisit  = ref('')

function clearFilters() {
  search.value = ''
  filterStatus.value = ''
  filterGender.value = ''
  filterAge.value = ''
  filterVisit.value = ''
}

const hasActiveFilters = computed(() =>
  search.value || filterStatus.value || filterGender.value || filterAge.value || filterVisit.value
)

// ── Filtered dataset ───────────────────────────────────────────
const filtered = computed(() => {
  let result = dataset.value

  // Search
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    )
  }

  // Status
  if (filterStatus.value) {
    result = result.filter(p => p.status === filterStatus.value)
  }

  // Gender
  if (filterGender.value) {
    result = result.filter(p => p.gender === filterGender.value)
  }

  // Age
  if (filterAge.value) {
    result = result.filter(p => {
      if (filterAge.value === 'under18') return p.age < 18
      if (filterAge.value === '18-30')   return p.age >= 18 && p.age <= 30
      if (filterAge.value === '31-45')   return p.age >= 31 && p.age <= 45
      if (filterAge.value === '46-60')   return p.age >= 46 && p.age <= 60
      if (filterAge.value === '60+')     return p.age > 60
      return true
    })
  }

  // Last Visit
  if (filterVisit.value) {
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    result = result.filter(p => {
      const d    = new Date(p.lastVisit)
      const diff = Math.round((today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000)
      if (filterVisit.value === 'today')     return diff === 0
      if (filterVisit.value === 'this-week') return diff <= 7
      if (filterVisit.value === 'this-month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (filterVisit.value === 'older')     return diff > 30
      return true
    })
  }

  return result
})

// ── Sorting ────────────────────────────────────────────────────
const sortKey = ref<keyof Patient | ''>('')
const sortDir = ref<'asc' | 'desc'>('asc')

function handleSort(key: string, dir: 'asc' | 'desc') {
  sortKey.value = key as keyof Patient
  sortDir.value = dir
}

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value
  return [...filtered.value].sort((a, b) => {
    const av = a[sortKey.value as keyof Patient] ?? ''
    const bv = b[sortKey.value as keyof Patient] ?? ''
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ── Pagination ─────────────────────────────────────────────────
const page    = ref(1)
const perPage = ref(10)

watch([filtered, perPage], () => { page.value = 1 })

const totalCount = computed(() => sorted.value.length)
const pageRows   = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sorted.value.slice(start, start + perPage.value)
})

const pageStart = computed(() => Math.min((page.value - 1) * perPage.value + 1, totalCount.value))
const pageEnd   = computed(() => Math.min(page.value * perPage.value, totalCount.value))

// ── Row Selection ──────────────────────────────────────────────
const selectedRows = ref<Patient[]>([])

function clearSelection() { selectedRows.value = [] }

// ── Column Visibility ──────────────────────────────────────────
const visibleColumns = ref({
  patient: true,
  contact: true,
  age:     true,
  gender:  true,
  lastVisit: true,
  status:  true,
})
const colVisOpen = ref(false)

// Toggle column visibility dropdown outside click
const colVisRef = ref<HTMLElement | null>(null)
function onDocClick(e: MouseEvent) {
  if (colVisRef.value && !colVisRef.value.contains(e.target as Node)) colVisOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

// ── Build columns for AppDataTable ────────────────────────────
const columns = computed(() => {
  const cols = []
  if (visibleColumns.value.patient)   cols.push({ key: 'fullName',   label: 'Patient',     sortable: true,  width: '240px' })
  if (visibleColumns.value.contact)   cols.push({ key: 'phone',      label: 'Contact',     sortable: false, width: '200px' })
  if (visibleColumns.value.age)       cols.push({ key: 'age',        label: 'Age',         sortable: true,  width: '72px',  align: 'center' as const })
  if (visibleColumns.value.gender)    cols.push({ key: 'gender',     label: 'Gender',      sortable: true,  width: '90px' })
  if (visibleColumns.value.lastVisit) cols.push({ key: 'lastVisit',  label: 'Last Visit',  sortable: true,  width: '150px' })
  if (visibleColumns.value.status)    cols.push({ key: 'status',     label: 'Status',      sortable: true,  width: '120px' })
  cols.push({ key: '_actions', label: '', width: '52px', align: 'center' as const })
  return cols
})

// ── Status badge map ───────────────────────────────────────────
const statusVariant: Record<PatientStatus, string> = {
  'Active':    'success',
  'Follow-up': 'primary',
  'New':       'info',
  'Inactive':  'warning',
  'Archived':  'neutral',
}

// ── Row actions ────────────────────────────────────────────────
const rowActionItems = [
  { key: 'view',        label: 'View Profile',          icon: iconEye },
  { key: 'edit',        label: 'Edit Patient',           icon: iconEdit },
  { key: 'appointment', label: 'Schedule Appointment',   icon: iconCalendar },
  { key: 'visit',       label: 'New Visit',              icon: iconClipboard },
  { key: 'rx',          label: 'Create Prescription',    icon: iconPill },
  { key: 'sep',         label: '',                       separator: true },
  { key: 'archive',     label: 'Archive Patient',        variant: 'danger' as const, icon: iconArchive },
]

function handleRowAction(key: string, patient: Patient) {
  if (key === 'view')        { openPreview(patient); return }
  if (key === 'edit')        { openEditModal(patient); return }
  if (key === 'appointment') { toast.info(`Appointment for ${patient.fullName}`, 'Coming Soon'); return }
  if (key === 'visit')       { toast.info(`New visit for ${patient.fullName}`, 'Coming Soon'); return }
  if (key === 'rx')          { toast.info(`Prescription for ${patient.fullName}`, 'Coming Soon'); return }
  if (key === 'archive')     {
    dataset.value = dataset.value.map(p => p.id === patient.id ? { ...p, status: 'Archived' } : p)
    toast.warning(`${patient.fullName} has been archived`, 'Archived')
  }
}

// ── Row click ─────────────────────────────────────────────────
function handleRowClick(row: Record<string, any>) {
  openPreview(row as Patient)
}

// ── Bulk actions ───────────────────────────────────────────────
function handleBulkExport() {
  toast.success(`${selectedRows.value.length} patient records exported`, 'Export Successful')
  clearSelection()
}
function handleBulkArchive() {
  const ids = new Set(selectedRows.value.map(p => p.id))
  dataset.value = dataset.value.map(p => ids.has(p.id) ? { ...p, status: 'Archived' } : p)
  toast.warning(`${selectedRows.value.length} patients archived`, 'Bulk Archive')
  clearSelection()
}

// ── Export ─────────────────────────────────────────────────────
function handleExport() {
  toast.success('Patient list exported successfully', 'Export')
}

// ── Patient Quick Preview Drawer ───────────────────────────────
const previewOpen    = ref(false)
const previewPatient = ref<Patient | null>(null)

function openPreview(p: Patient) {
  previewPatient.value = p
  previewOpen.value = true
}

// ── Add Patient Modal ──────────────────────────────────────────
const addOpen  = ref(false)
const addForm  = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: 'Male' as PatientGender,
  address: '',
  emergencyContact: '',
  notes: '',
})
const addLoading = ref(false)

function openAddModal() {
  addForm.value = {
    firstName: '', lastName: '', phone: '', email: '',
    dateOfBirth: '', gender: 'Male', address: '', emergencyContact: '', notes: '',
  }
  addOpen.value = true
}

function computeAge(dob: string): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function handleAddPatient() {
  if (!addForm.value.firstName || !addForm.value.lastName || !addForm.value.phone) {
    toast.error('Please fill in required fields (First Name, Last Name, Phone)', 'Validation Error')
    return
  }
  addLoading.value = true
  setTimeout(() => {
    const maxId = Math.max(...dataset.value.map(p => p.id))
    const maxPid = parseInt(dataset.value[0]?.patientId.replace('PT-', '') ?? '1284', 10)
    const newPatient: Patient = {
      id:                 maxId + 1,
      patientId:          `PT-${String(maxPid + 1).padStart(6, '0')}`,
      firstName:          addForm.value.firstName,
      lastName:           addForm.value.lastName,
      fullName:           `${addForm.value.firstName} ${addForm.value.lastName}`,
      phone:              addForm.value.phone,
      email:              addForm.value.email,
      age:                computeAge(addForm.value.dateOfBirth),
      gender:             addForm.value.gender,
      status:             'New',
      lastVisit:          new Date().toISOString().split('T')[0],
      nextAppointment:    null,
      totalVisits:        0,
      createdAt:          new Date().toISOString().split('T')[0],
      address:            addForm.value.address,
      dateOfBirth:        addForm.value.dateOfBirth,
      emergencyContact:   addForm.value.emergencyContact,
      notes:              addForm.value.notes,
    }
    dataset.value = [newPatient, ...dataset.value]
    addLoading.value = false
    addOpen.value = false
    toast.success(`${newPatient.fullName} has been added successfully`, 'Patient Created')
  }, 800)
}

// ── Edit Patient Modal ────────────────────────────────────────
const editOpen  = ref(false)
const editForm  = ref<Partial<Patient>>({})

function openEditModal(p: Patient) {
  editForm.value = { ...p }
  editOpen.value = true
}
function handleEditPatient() {
  dataset.value = dataset.value.map(p =>
    p.id === editForm.value.id ? { ...p, ...editForm.value, fullName: `${editForm.value.firstName} ${editForm.value.lastName}` } : p
  )
  editOpen.value = false
  toast.success('Patient record updated successfully', 'Patient Updated')
}

// ── SVG Icons ─────────────────────────────────────────────────
const iconPlus    = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
const iconExport  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
const iconSearch  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
const iconX       = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
const iconColumns = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
const iconDots    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`
const iconEye     = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
const iconEdit    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
const iconCalendar= `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
const iconClipboard=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`
const iconPill    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v7.5"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>`
const iconArchive = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
const iconUser    = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const iconPhone   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.13h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`
const iconMail    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
const iconStar    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
const iconCheck   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
</script>

<template>
  <div class="patients-page">
    <!-- ── Page Header ──────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Patients</h1>
        <p class="page-subtitle">Manage and monitor your clinic patients.</p>
      </div>
      <div class="header-right">
        <AppButton variant="secondary" size="sm" :icon-left="iconExport" @click="handleExport">
          Export
        </AppButton>
        <AppButton variant="primary" size="sm" :icon-left="iconPlus" @click="openAddModal">
          Add Patient
        </AppButton>
      </div>
    </div>

    <!-- ── Stats Row ────────────────────────────────────────── -->
    <div class="stats-grid">
      <AppStatCard
        title="Total Patients"
        :value="stats.total.toLocaleString()"
        :change="8.4"
        change-label="vs last month"
        variant="primary"
        :loading="isLoading"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8'><path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 00-3-3.87'/><path d='M16 3.13a4 4 0 010 7.75'/></svg>`"
      />
      <AppStatCard
        title="Active Patients"
        :value="stats.active.toLocaleString()"
        :description="`${Math.round(stats.active / Math.max(stats.total, 1) * 100)}% of total`"
        variant="success"
        :loading="isLoading"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8'><path d='M22 11.08V12a10 10 0 11-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>`"
      />
      <AppStatCard
        title="New This Month"
        :value="stats.newMonth.toLocaleString()"
        :change="14.2"
        change-label="vs last month"
        variant="info"
        :loading="isLoading"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='16'/><line x1='8' y1='12' x2='16' y2='12'/></svg>`"
      />
      <AppStatCard
        title="Follow-ups"
        :value="stats.followUps.toLocaleString()"
        description="Due this week"
        variant="warning"
        :loading="isLoading"
        :icon="`<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>`"
      />
    </div>

    <!-- ── Search / Filter Toolbar ──────────────────────────── -->
    <div class="toolbar glass-card">
      <!-- Search -->
      <div class="toolbar-search">
        <span class="search-icon" v-html="iconSearch" />
        <input
          v-model="search"
          class="search-input focus-ring"
          type="text"
          placeholder="Search by name, phone or patient ID…"
          aria-label="Search patients"
        />
        <button v-if="search" class="search-clear focus-ring" aria-label="Clear search" @click="search = ''" v-html="iconX" />
      </div>

      <!-- Filters -->
      <div class="toolbar-filters">
        <select v-model="filterStatus" class="filter-select focus-ring" aria-label="Filter by status">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Follow-up">Follow-up</option>
          <option value="New">New</option>
          <option value="Inactive">Inactive</option>
          <option value="Archived">Archived</option>
        </select>

        <select v-model="filterGender" class="filter-select focus-ring" aria-label="Filter by gender">
          <option value="">All Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select v-model="filterAge" class="filter-select focus-ring" aria-label="Filter by age">
          <option value="">All Ages</option>
          <option value="under18">Under 18</option>
          <option value="18-30">18 – 30</option>
          <option value="31-45">31 – 45</option>
          <option value="46-60">46 – 60</option>
          <option value="60+">60+</option>
        </select>

        <select v-model="filterVisit" class="filter-select focus-ring" aria-label="Filter by last visit">
          <option value="">Last Visit</option>
          <option value="today">Today</option>
          <option value="this-week">This Week</option>
          <option value="this-month">This Month</option>
          <option value="older">Older</option>
        </select>

        <button v-if="hasActiveFilters" class="clear-filters focus-ring" @click="clearFilters">
          <span v-html="iconX" />
          Clear
        </button>
      </div>

      <!-- Right actions -->
      <div class="toolbar-actions">
        <AppButton variant="secondary" size="sm" :icon-left="iconExport" @click="handleExport">
          Export
        </AppButton>

        <!-- Columns toggle -->
        <div ref="colVisRef" class="col-vis-root">
          <AppButton
            variant="secondary"
            size="sm"
            :icon-left="iconColumns"
            @click="colVisOpen = !colVisOpen"
          >
            Columns
          </AppButton>
          <Transition name="dropdown">
            <div v-if="colVisOpen" class="col-vis-menu" role="menu">
              <div class="col-vis-title">Toggle Columns</div>
              <template v-for="(visible, key) in visibleColumns" :key="key">
                <button
                  class="col-vis-item"
                  :class="key === 'patient' ? 'col-vis-item-locked' : ''"
                  :disabled="key === 'patient'"
                  role="menuitem"
                  :aria-pressed="visible"
                  @click="key !== 'patient' && (visibleColumns[key] = !visibleColumns[key])"
                >
                  <span class="col-vis-check" :class="visible ? 'col-vis-check-on' : ''" v-html="visible ? iconCheck : ''" />
                  {{ key.charAt(0).toUpperCase() + key.slice(1) }}
                  <span v-if="key === 'patient'" class="col-vis-lock">Always</span>
                </button>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- ── Bulk Action Bar ──────────────────────────────────── -->
    <Transition name="slide-down">
      <div v-if="selectedRows.length > 0" class="bulk-bar glass">
        <span class="bulk-count">
          <span class="bulk-num">{{ selectedRows.length }}</span>
          patient{{ selectedRows.length !== 1 ? 's' : '' }} selected
        </span>
        <div class="bulk-actions">
          <AppButton variant="outline" size="sm" :icon-left="iconExport" @click="handleBulkExport">
            Export
          </AppButton>
          <AppButton variant="warning" size="sm" :icon-left="iconArchive" @click="handleBulkArchive">
            Archive
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="clearSelection">
            Cancel
          </AppButton>
        </div>
      </div>
    </Transition>

    <!-- ── Data Table Card ──────────────────────────────────── -->
    <div class="table-card glass-card">
      <!-- Table header -->
      <div class="table-header">
        <div class="table-header-left">
          <span class="table-title">Patients</span>
          <span class="table-count">
            {{ isLoading ? '–' : totalCount.toLocaleString() }} patient{{ totalCount !== 1 ? 's' : '' }}
          </span>
        </div>
        <div class="table-header-right">
          <select v-model="perPage" class="per-page-select focus-ring" aria-label="Rows per page">
            <option :value="10">10 / page</option>
            <option :value="25">25 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
          </select>
        </div>
      </div>

      <!-- AppDataTable -->
      <AppDataTable
        v-model="selectedRows"
        :columns="columns"
        :rows="pageRows"
        :loading="isLoading"
        :selectable="true"
        key-field="id"
        empty-title="No patients found"
        empty-description="Try adjusting your search or filters."
        @row-click="handleRowClick"
        @sort="handleSort"
      >
        <!-- ── Patient cell ── -->
        <template #cell-fullName="{ row }">
          <div class="patient-cell">
            <AppAvatar :name="row.fullName" size="sm" shape="rounded" />
            <div class="patient-info">
              <span class="patient-name">{{ row.fullName }}</span>
              <span class="patient-id">{{ row.patientId }}</span>
            </div>
          </div>
        </template>

        <!-- ── Contact cell ── -->
        <template #cell-phone="{ row }">
          <div class="contact-cell">
            <span class="contact-phone">{{ row.phone }}</span>
            <span class="contact-email">{{ row.email }}</span>
          </div>
        </template>

        <!-- ── Age cell ── -->
        <template #cell-age="{ row }">
          <span class="age-cell">{{ row.age }}</span>
        </template>

        <!-- ── Gender cell ── -->
        <template #cell-gender="{ row }">
          <span class="gender-cell" :class="row.gender === 'Male' ? 'gender-male' : 'gender-female'">
            {{ row.gender }}
          </span>
        </template>

        <!-- ── Last Visit cell ── -->
        <template #cell-lastVisit="{ row }">
          <div class="visit-cell">
            <span class="visit-date">{{ formatLastVisit(row.lastVisit) }}</span>
            <span v-if="row.status === 'Follow-up'" class="visit-tag">Follow-up</span>
          </div>
        </template>

        <!-- ── Status cell ── -->
        <template #cell-status="{ row }">
          <AppBadge :variant="statusVariant[row.status as PatientStatus]" dot>
            {{ row.status }}
          </AppBadge>
        </template>

        <!-- ── Actions cell ── -->
        <template #cell-_actions="{ row }">
          <div class="action-cell" @click.stop>
            <AppDropdown :items="rowActionItems" align="right" @select="key => handleRowAction(key, row as Patient)">
              <template #trigger>
                <button class="action-btn focus-ring" aria-label="Row actions" v-html="iconDots" />
              </template>
            </AppDropdown>
          </div>
        </template>

        <!-- ── Empty state ── -->
        <template v-if="!isLoading && totalCount === 0" #empty>
          <AppEmptyState
            title="No patients found"
            description="Try adjusting your search or filters."
            action-label="Clear Filters"
            @action="clearFilters"
          />
        </template>
      </AppDataTable>

      <!-- ── Pagination ─────────────────────────────────────── -->
      <div class="table-footer">
        <span class="pagination-info">
          <template v-if="totalCount > 0">
            Showing <strong>{{ pageStart }}–{{ pageEnd }}</strong> of <strong>{{ totalCount.toLocaleString() }}</strong> patients
          </template>
          <template v-else>No results</template>
        </span>
        <AppPagination
          v-model="page"
          :total="totalCount"
          :per-page="perPage"
          :sibling-count="1"
        />
      </div>
    </div>

    <!-- ── Patient Preview Drawer ──────────────────────────── -->
    <AppDrawer
      v-model="previewOpen"
      title="Patient Overview"
      side="right"
      size="md"
    >
      <template v-if="previewPatient">
        <div class="preview-content">
          <!-- Avatar + name -->
          <div class="preview-hero">
            <AppAvatar :name="previewPatient.fullName" size="xl" shape="rounded" />
            <div class="preview-hero-info">
              <h2 class="preview-name">{{ previewPatient.fullName }}</h2>
              <span class="preview-pid">{{ previewPatient.patientId }}</span>
              <AppBadge :variant="statusVariant[previewPatient.status]" dot size="sm">
                {{ previewPatient.status }}
              </AppBadge>
            </div>
          </div>

          <div class="preview-divider" />

          <!-- Info grid -->
          <div class="preview-grid">
            <div class="preview-field">
              <span class="preview-label">Age</span>
              <span class="preview-value">{{ previewPatient.age }} years</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Gender</span>
              <span class="preview-value">{{ previewPatient.gender }}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Phone</span>
              <span class="preview-value">{{ previewPatient.phone }}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Email</span>
              <span class="preview-value">{{ previewPatient.email || '—' }}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Last Visit</span>
              <span class="preview-value">{{ formatLastVisit(previewPatient.lastVisit) }}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Next Appointment</span>
              <span class="preview-value">
                {{ previewPatient.nextAppointment
                   ? new Date(previewPatient.nextAppointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                   : 'Not scheduled' }}
              </span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Total Visits</span>
              <span class="preview-value">{{ previewPatient.totalVisits }}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Patient Since</span>
              <span class="preview-value">
                {{ new Date(previewPatient.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
              </span>
            </div>
          </div>

          <template v-if="previewPatient.address">
            <div class="preview-divider" />
            <div class="preview-field-full">
              <span class="preview-label">Address</span>
              <span class="preview-value">{{ previewPatient.address }}</span>
            </div>
          </template>

          <template v-if="previewPatient.notes">
            <div class="preview-divider" />
            <div class="preview-field-full">
              <span class="preview-label">Clinical Notes</span>
              <p class="preview-notes">{{ previewPatient.notes }}</p>
            </div>
          </template>
        </div>
      </template>

      <template #footer>
        <AppButton variant="ghost" size="sm" @click="previewOpen = false">Close</AppButton>
        <AppButton variant="outline" size="sm" :icon-left="iconCalendar" @click="() => { previewOpen = false; toast.info('Scheduling appointment…', 'Coming Soon') }">
          Appointment
        </AppButton>
        <AppButton variant="primary" size="sm" :icon-left="iconEdit" @click="() => { previewOpen = false; openEditModal(previewPatient!) }">
          Edit Patient
        </AppButton>
      </template>
    </AppDrawer>

    <!-- ── Add Patient Modal ───────────────────────────────── -->
    <AppModal
      v-model="addOpen"
      title="Add New Patient"
      size="lg"
      :show-close="true"
    >
      <form class="patient-form" @submit.prevent="handleAddPatient">
        <div class="form-row">
          <AppInput
            v-model="addForm.firstName"
            label="First Name"
            placeholder="e.g. Ahmed"
            required
            id="add-first-name"
          />
          <AppInput
            v-model="addForm.lastName"
            label="Last Name"
            placeholder="e.g. Hassan"
            required
            id="add-last-name"
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="addForm.phone"
            label="Phone Number"
            placeholder="+20 100 000 0000"
            type="tel"
            required
            id="add-phone"
          />
          <AppInput
            v-model="addForm.email"
            label="Email Address"
            placeholder="patient@example.com"
            type="email"
            id="add-email"
          />
        </div>
        <div class="form-row">
          <AppInput
            v-model="addForm.dateOfBirth"
            label="Date of Birth"
            type="text"
            placeholder="YYYY-MM-DD"
            id="add-dob"
          />
          <AppSelect
            v-model="addForm.gender"
            label="Gender"
            :options="[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]"
            id="add-gender"
          />
        </div>
        <AppInput
          v-model="addForm.address"
          label="Address"
          placeholder="Street, District, City"
          id="add-address"
        />
        <AppInput
          v-model="addForm.emergencyContact"
          label="Emergency Contact"
          placeholder="+20 100 000 0000"
          type="tel"
          id="add-emergency"
        />
        <AppTextarea
          v-model="addForm.notes"
          label="Clinical Notes"
          placeholder="Any relevant medical history, allergies or notes…"
          :rows="3"
          id="add-notes"
        />
      </form>

      <template #footer>
        <AppButton variant="ghost" @click="addOpen = false">Cancel</AppButton>
        <AppButton variant="primary" :loading="addLoading" @click="handleAddPatient">
          Create Patient
        </AppButton>
      </template>
    </AppModal>

    <!-- ── Edit Patient Modal ──────────────────────────────── -->
    <AppModal
      v-model="editOpen"
      title="Edit Patient"
      size="lg"
      :show-close="true"
    >
      <form class="patient-form" @submit.prevent="handleEditPatient">
        <div class="form-row">
          <AppInput v-model="editForm.firstName" label="First Name" required id="edit-first-name" />
          <AppInput v-model="editForm.lastName"  label="Last Name"  required id="edit-last-name" />
        </div>
        <div class="form-row">
          <AppInput v-model="editForm.phone" label="Phone Number" type="tel" id="edit-phone" />
          <AppInput v-model="editForm.email" label="Email Address" type="email" id="edit-email" />
        </div>
        <div class="form-row">
          <AppSelect
            v-model="editForm.status"
            label="Status"
            :options="[
              { value: 'Active',    label: 'Active' },
              { value: 'Follow-up', label: 'Follow-up' },
              { value: 'New',       label: 'New' },
              { value: 'Inactive',  label: 'Inactive' },
              { value: 'Archived',  label: 'Archived' },
            ]"
            id="edit-status"
          />
          <AppSelect
            v-model="editForm.gender"
            label="Gender"
            :options="[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]"
            id="edit-gender"
          />
        </div>
        <AppInput v-model="editForm.address" label="Address" id="edit-address" />
        <AppTextarea v-model="editForm.notes" label="Clinical Notes" :rows="3" id="edit-notes" />
      </form>

      <template #footer>
        <AppButton variant="ghost" @click="editOpen = false">Cancel</AppButton>
        <AppButton variant="primary" @click="handleEditPatient">Save Changes</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
/* ── Page ── */
.patients-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fade-in 220ms ease both;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.header-left { display: flex; flex-direction: column; gap: 0.25rem; }
.page-title  { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.025em; color: #F4F8FC; margin: 0; line-height: 1.2; }
.page-subtitle { font-size: 0.875rem; color: #5D7187; margin: 0; }
.header-right { display: flex; align-items: center; gap: 0.625rem; flex-shrink: 0; flex-wrap: wrap; }

/* ── Stats grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .stats-grid { grid-template-columns: 1fr; } }

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  flex-wrap: wrap;
}

/* Search */
.toolbar-search {
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5D7187;
  display: flex;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 2.25rem;
  padding: 0 2.25rem 0 2.25rem;
  background: rgba(9, 24, 39, 0.80);
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 10px;
  color: #F4F8FC;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.search-input::placeholder { color: #5D7187; }
.search-input:focus {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40,185,255,0.16), 0 0 12px rgba(40,185,255,0.08);
}
.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px; height: 20px;
  border: none;
  background: transparent;
  color: #5D7187;
  cursor: pointer;
  border-radius: 4px;
  transition: color 150ms ease, background 150ms ease;
}
.search-clear:hover { color: #F4F8FC; background: rgba(100,190,255,0.08); }

/* Filters */
.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}
.filter-select {
  height: 2.25rem;
  padding: 0 2rem 0 0.75rem;
  background: rgba(9, 24, 39, 0.80)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235D7187' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 0.6rem center;
  border: 1px solid rgba(100, 190, 255, 0.14);
  border-radius: 9px;
  color: #8FA3B8;
  font-size: 0.8125rem;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  white-space: nowrap;
}
.filter-select:focus {
  border-color: #28B9FF;
  box-shadow: 0 0 0 2px rgba(40,185,255,0.14);
  color: #F4F8FC;
}
.filter-select option { background: #081321; color: #F4F8FC; }

.clear-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 2.25rem;
  padding: 0 0.75rem;
  background: rgba(255,102,122,0.08);
  border: 1px solid rgba(255,102,122,0.25);
  border-radius: 9px;
  color: #FF667A;
  font-size: 0.8125rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms ease;
  outline: none;
}
.clear-filters:hover { background: rgba(255,102,122,0.15); border-color: rgba(255,102,122,0.45); }

/* Toolbar right actions */
.toolbar-actions { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }

/* Column visibility */
.col-vis-root { position: relative; display: inline-flex; }
.col-vis-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 300;
  background: rgba(9, 24, 39, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(100,190,255,0.18);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.50), 0 0 20px rgba(40,185,255,0.06);
  padding: 0.5rem;
  min-width: 180px;
}
.col-vis-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5D7187;
  padding: 0.25rem 0.625rem 0.5rem;
}
.col-vis-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #F4F8FC;
  cursor: pointer;
  text-align: left;
  transition: background 150ms ease;
}
.col-vis-item:hover:not(:disabled) { background: rgba(100,190,255,0.08); }
.col-vis-item-locked { opacity: 0.5; cursor: not-allowed; }
.col-vis-check {
  width: 16px; height: 16px;
  border-radius: 4px;
  border: 1.5px solid rgba(100,190,255,0.30);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #050B14;
  font-size: 0.7rem;
  transition: background 150ms ease, border-color 150ms ease;
}
.col-vis-check-on {
  background: linear-gradient(135deg, #1688D4, #28B9FF);
  border-color: transparent;
}
.col-vis-lock {
  margin-left: auto;
  font-size: 0.65rem;
  color: #5D7187;
  background: rgba(100,190,255,0.08);
  padding: 1px 6px;
  border-radius: 4px;
}

/* Dropdown animation */
.dropdown-enter-active { animation: dd-in 160ms ease both; }
.dropdown-leave-active { animation: dd-out 130ms ease both; }
@keyframes dd-in  { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dd-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: translateY(-4px) scale(0.97); } }

/* ── Bulk bar ── */
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  flex-wrap: wrap;
}
.bulk-count { font-size: 0.875rem; color: #8FA3B8; }
.bulk-num   { color: #28B9FF; font-weight: 600; }
.bulk-actions { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }

.slide-down-enter-active { transition: all 220ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-down-leave-active { transition: all 180ms ease; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ── Table card ── */
.table-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(100,190,255,0.10);
  flex-shrink: 0;
  gap: 1rem;
  flex-wrap: wrap;
}
.table-header-left { display: flex; align-items: center; gap: 0.75rem; }
.table-title { font-size: 0.9375rem; font-weight: 600; color: #F4F8FC; }
.table-count {
  font-size: 0.75rem;
  color: #5D7187;
  background: rgba(100,190,255,0.06);
  border: 1px solid rgba(100,190,255,0.12);
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
}
.per-page-select {
  height: 2rem;
  padding: 0 1.75rem 0 0.625rem;
  background: rgba(9, 24, 39, 0.80)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235D7187' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 0.5rem center;
  border: 1px solid rgba(100,190,255,0.14);
  border-radius: 8px;
  color: #8FA3B8;
  font-size: 0.8125rem;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 150ms ease;
}
.per-page-select:focus { border-color: #28B9FF; }
.per-page-select option { background: #081321; color: #F4F8FC; }

/* ── Table footer ── */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid rgba(100,190,255,0.08);
  flex-wrap: wrap;
  gap: 0.75rem;
}
.pagination-info { font-size: 0.8125rem; color: #5D7187; }
.pagination-info strong { color: #8FA3B8; }

/* ── Cell: Patient ── */
.patient-cell { display: flex; align-items: center; gap: 0.75rem; }
.patient-info { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.patient-name { font-size: 0.875rem; font-weight: 500; color: #F4F8FC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.patient-id   { font-size: 0.75rem; color: #5D7187; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }

/* ── Cell: Contact ── */
.contact-cell  { display: flex; flex-direction: column; gap: 0.15rem; }
.contact-phone { font-size: 0.875rem; color: #F4F8FC; white-space: nowrap; }
.contact-email { font-size: 0.75rem; color: #5D7187; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }

/* ── Cell: Age ── */
.age-cell { font-size: 0.875rem; color: #8FA3B8; font-weight: 500; }

/* ── Cell: Gender ── */
.gender-cell { font-size: 0.8125rem; font-weight: 500; }
.gender-male   { color: #4DB8FF; }
.gender-female { color: #FF9ED2; }

/* ── Cell: Last Visit ── */
.visit-cell { display: flex; flex-direction: column; gap: 0.2rem; }
.visit-date { font-size: 0.875rem; color: #8FA3B8; white-space: nowrap; }
.visit-tag  {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #28B9FF;
  background: rgba(40,185,255,0.08);
  border: 1px solid rgba(40,185,255,0.20);
  border-radius: 4px;
  padding: 1px 5px;
  width: fit-content;
}

/* ── Cell: Actions ── */
.action-cell { display: flex; justify-content: center; }
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border: none;
  background: transparent;
  color: #5D7187;
  border-radius: 7px;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.action-btn:hover { background: rgba(100,190,255,0.10); color: #F4F8FC; }

/* ── Preview Drawer content ── */
.preview-content { display: flex; flex-direction: column; gap: 1.25rem; }
.preview-hero { display: flex; align-items: center; gap: 1rem; }
.preview-hero-info { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
.preview-name { font-size: 1.125rem; font-weight: 600; color: #F4F8FC; margin: 0; }
.preview-pid  { font-size: 0.75rem; color: #5D7187; font-family: 'JetBrains Mono', monospace; }
.preview-divider { height: 1px; background: rgba(100,190,255,0.10); }
.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem 1.25rem;
}
.preview-field { display: flex; flex-direction: column; gap: 0.2rem; }
.preview-field-full { display: flex; flex-direction: column; gap: 0.4rem; }
.preview-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #5D7187; }
.preview-value { font-size: 0.875rem; color: #F4F8FC; }
.preview-notes { font-size: 0.8125rem; color: #8FA3B8; line-height: 1.5; margin: 0; background: rgba(100,190,255,0.04); border: 1px solid rgba(100,190,255,0.08); border-radius: 10px; padding: 0.75rem; }

/* ── Patient form ── */
.patient-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }

/* ── Responsive ── */
@media (max-width: 768px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .toolbar-search { max-width: 100%; }
  .toolbar-filters { justify-content: flex-start; }
  .toolbar-actions { justify-content: flex-end; }
  .table-footer { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .page-header { flex-direction: column; }
  .header-right { width: 100%; justify-content: flex-end; }
}
</style>
