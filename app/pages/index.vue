<script setup lang="ts">
import {
  dashboardStats,
  appointmentData,
  todayAppointments,
  patientOverview,
  recentPatients,
  recentActivity,
  followUpReminders,
} from '@/data/dashboard'

useHead({ title: 'Dashboard — Dr. Dalia Clinic' })

// ── Date greeting ─────────────────────────────────────────────
const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
const todayFormatted = now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

// ── Appointment chart (pure SVG area chart) ───────────────────
const chartWidth  = 600
const chartHeight = 160
const chartPadL   = 36
const chartPadR   = 16
const chartPadT   = 16
const chartPadB   = 32

const maxVal = Math.max(...appointmentData.map(d => d.appointments))
const minVal = 0

function xPos(i: number) {
  const step = (chartWidth - chartPadL - chartPadR) / (appointmentData.length - 1)
  return chartPadL + i * step
}
function yPos(v: number) {
  const h = chartHeight - chartPadT - chartPadB
  return chartPadT + h - ((v - minVal) / (maxVal - minVal)) * h
}

const linePath = computed(() =>
  appointmentData.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.appointments)}`).join(' ')
)
const areaPath = computed(() => {
  const last = appointmentData.length - 1
  return (
    linePath.value +
    ` L${xPos(last)},${chartHeight - chartPadB} L${xPos(0)},${chartHeight - chartPadB} Z`
  )
})

// Tooltip
const hoveredPoint = ref<{ i: number; x: number; y: number; val: number } | null>(null)
function onPointEnter(i: number) {
  hoveredPoint.value = {
    i,
    x: xPos(i),
    y: yPos(appointmentData[i].appointments),
    val: appointmentData[i].appointments,
  }
}
function onPointLeave() {
  hoveredPoint.value = null
}

// ── Donut chart ───────────────────────────────────────────────
const DONUT_R   = 64
const DONUT_GAP = 3
const DONUT_SW  = 20
const total     = patientOverview.reduce((s, d) => s + d.value, 0)

function donutSegments() {
  let offset = -90
  return patientOverview.map(d => {
    const pct   = d.value / total
    const angle = pct * 360
    const r     = DONUT_R
    const startA = (offset * Math.PI) / 180
    const endA   = ((offset + angle - DONUT_GAP) * Math.PI) / 180
    const cx = 80; const cy = 80
    const x1 = cx + r * Math.cos(startA)
    const y1 = cy + r * Math.sin(startA)
    const x2 = cx + r * Math.cos(endA)
    const y2 = cy + r * Math.sin(endA)
    const large = angle - DONUT_GAP > 180 ? 1 : 0
    const path = `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}`
    offset += angle
    return { ...d, path, pct: Math.round(pct * 100) }
  })
}
const segments = computed(() => donutSegments())

// ── Table columns ─────────────────────────────────────────────
const patientColumns = [
  { key: 'name',      label: 'Patient',    sortable: false },
  { key: 'age',       label: 'Age',        sortable: false, align: 'center' as const, width: '70px' },
  { key: 'lastVisit', label: 'Last Visit', sortable: false },
  { key: 'status',    label: 'Status',     sortable: false },
  { key: 'action',    label: 'Action',     sortable: false, align: 'center' as const, width: '80px' },
]

// Status config
const appointmentStatusMap = {
  confirmed: { variant: 'success'  as const, label: 'Confirmed' },
  waiting:   { variant: 'warning'  as const, label: 'Waiting'   },
  completed: { variant: 'neutral'  as const, label: 'Completed' },
  pending:   { variant: 'primary'  as const, label: 'Pending'   },
}

const patientStatusMap = {
  active:   { variant: 'success' as const, label: 'Active'    },
  followup: { variant: 'info'    as const, label: 'Follow-up' },
  new:      { variant: 'warning' as const, label: 'New'       },
}

// ── Quick actions ─────────────────────────────────────────────
const quickActions = [
  {
    id: 'new-patient',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
    label: 'New Patient',
    desc:  'Register a new patient',
    to:    '/patients',
    variant: 'primary' as const,
  },
  {
    id: 'new-appointment',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>`,
    label: 'New Appointment',
    desc:  'Schedule a visit',
    to:    '/appointments',
    variant: 'info' as const,
  },
  {
    id: 'new-visit',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
    label: 'New Visit',
    desc:  'Start a consultation',
    to:    '/visits',
    variant: 'success' as const,
  },
  {
    id: 'new-prescription',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v7.5"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>`,
    label: 'New Prescription',
    desc:  'Create a prescription',
    to:    '/medications',
    variant: 'warning' as const,
  },
]

const quickActionColors: Record<string, { icon: string; bg: string; glow: string }> = {
  primary: { icon: '#28B9FF', bg: 'rgba(40,185,255,0.10)',  glow: 'rgba(40,185,255,0.15)' },
  info:    { icon: '#4DB8FF', bg: 'rgba(77,184,255,0.10)',  glow: 'rgba(77,184,255,0.12)' },
  success: { icon: '#35D39A', bg: 'rgba(53,211,154,0.10)',  glow: 'rgba(53,211,154,0.12)' },
  warning: { icon: '#FFCA63', bg: 'rgba(255,202,99,0.10)',  glow: 'rgba(255,202,99,0.12)'  },
}

// Icons
const plusIcon    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
const arrowIcon   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`
const eyeIcon     = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
const alertIcon   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`

// Y-axis labels
const yLabels = computed(() => {
  const step = Math.ceil(maxVal / 4)
  return [0, step, step * 2, step * 3, step * 4].reverse()
})
</script>

<template>
  <div class="dashboard animate-fade-in">

    <!-- ══════════════════ PAGE HEADER ══════════════════ -->
    <div class="dash-header">
      <div class="dash-header-left">
        <div class="header-title-row">
          <h1 class="text-page-title">{{ greeting }}, Dr. Dalia 👋</h1>
          <span class="demo-badge">
            <span class="demo-dot" />
            Demo Environment
          </span>
        </div>
        <p class="text-secondary" style="margin-top:0.35rem;">
          Here's an overview of your clinic today.
          <span class="date-text">{{ todayFormatted }}</span>
        </p>
      </div>
      <div class="dash-header-actions">
        <AppButton
          variant="secondary"
          size="md"
          :icon-left="plusIcon"
          @click="$router.push('/patients')"
        >
          New Patient
        </AppButton>
        <AppButton
          variant="primary"
          size="md"
          :icon-left="plusIcon"
          @click="$router.push('/appointments')"
        >
          New Appointment
        </AppButton>
      </div>
    </div>

    <!-- ══════════════════ STAT CARDS ══════════════════ -->
    <div class="stat-grid">
      <AppStatCard
        v-for="s in dashboardStats"
        :key="s.key"
        :icon="s.icon"
        :title="s.title"
        :value="s.value"
        :change="s.change"
        :change-label="s.changeLabel"
        :description="s.description"
        :variant="s.variant"
      />
    </div>

    <!-- ══════════════════ ROW 2: ANALYTICS + SCHEDULE ══════════════════ -->
    <div class="row-2">

      <!-- Appointment Overview Chart -->
      <AppCard variant="default" padding="none" class="analytics-card">
        <template #header>
          <div class="card-header-row" style="padding: 1.25rem 1.5rem 0;">
            <div>
              <p class="text-card-title">Appointment Overview</p>
              <p class="text-muted" style="font-size:0.8125rem; margin-top:0.2rem;">Last 7 days</p>
            </div>
            <div class="chart-legend">
              <span class="legend-dot" style="background:#28B9FF;" />
              <span class="text-caption">Appointments</span>
            </div>
          </div>
        </template>

        <div class="chart-wrap">
          <svg
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            class="area-chart"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Appointment chart for last 7 days"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#28B9FF" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#28B9FF" stop-opacity="0.01" />
              </linearGradient>
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <!-- Grid lines -->
            <g class="chart-grid">
              <line
                v-for="(lbl, li) in yLabels"
                :key="li"
                :x1="chartPadL"
                :x2="chartWidth - chartPadR"
                :y1="yPos(lbl)"
                :y2="yPos(lbl)"
                stroke="rgba(100,190,255,0.07)"
                stroke-width="1"
              />
            </g>

            <!-- Y labels -->
            <g class="chart-ylabels">
              <text
                v-for="(lbl, li) in yLabels"
                :key="li"
                :x="chartPadL - 6"
                :y="yPos(lbl) + 4"
                text-anchor="end"
                font-size="9"
                fill="rgba(93,113,135,0.8)"
                font-family="Inter,system-ui,sans-serif"
              >{{ lbl }}</text>
            </g>

            <!-- Area fill -->
            <path
              :d="areaPath"
              fill="url(#areaGrad)"
              class="chart-area"
            />

            <!-- Line -->
            <path
              :d="linePath"
              fill="none"
              stroke="#28B9FF"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
              filter="url(#glowFilter)"
              class="chart-line"
            />

            <!-- X Labels + dots -->
            <g v-for="(d, i) in appointmentData" :key="i">
              <!-- X label -->
              <text
                :x="xPos(i)"
                :y="chartHeight - chartPadB + 16"
                text-anchor="middle"
                font-size="9"
                fill="rgba(93,113,135,0.9)"
                font-family="Inter,system-ui,sans-serif"
              >{{ d.day }}</text>

              <!-- Invisible hover target -->
              <circle
                :cx="xPos(i)"
                :cy="yPos(d.appointments)"
                r="12"
                fill="transparent"
                style="cursor:pointer;"
                @mouseenter="onPointEnter(i)"
                @mouseleave="onPointLeave"
              />

              <!-- Visible dot -->
              <circle
                :cx="xPos(i)"
                :cy="yPos(d.appointments)"
                r="3.5"
                fill="#28B9FF"
                stroke="rgba(5,11,20,0.9)"
                stroke-width="1.5"
                class="chart-dot"
                :class="hoveredPoint?.i === i ? 'chart-dot-active' : ''"
              />
            </g>

            <!-- Tooltip -->
            <g v-if="hoveredPoint" class="chart-tooltip">
              <rect
                :x="hoveredPoint.x - 22"
                :y="hoveredPoint.y - 32"
                width="44"
                height="22"
                rx="6"
                fill="rgba(9,24,39,0.95)"
                stroke="rgba(40,185,255,0.30)"
                stroke-width="1"
              />
              <text
                :x="hoveredPoint.x"
                :y="hoveredPoint.y - 17"
                text-anchor="middle"
                font-size="10"
                font-weight="600"
                fill="#28B9FF"
                font-family="Inter,system-ui,sans-serif"
              >{{ hoveredPoint.val }}</text>
            </g>
          </svg>
        </div>
      </AppCard>

      <!-- Today's Schedule -->
      <AppCard variant="default" padding="none" class="schedule-card">
        <template #header>
          <div class="card-header-row" style="padding: 1.25rem 1.5rem 0;">
            <p class="text-card-title">Today's Appointments</p>
            <NuxtLink to="/appointments" class="view-link">
              View Calendar
              <span v-html="arrowIcon" class="view-link-icon" />
            </NuxtLink>
          </div>
        </template>

        <div class="schedule-list">
          <div
            v-for="appt in todayAppointments"
            :key="appt.id"
            class="schedule-row row-hover"
          >
            <div class="schedule-time">
              <span class="time-label">{{ appt.time }}</span>
            </div>
            <div class="schedule-info">
              <span class="schedule-patient">{{ appt.patient }}</span>
              <span class="schedule-type text-muted">{{ appt.type }}</span>
            </div>
            <AppBadge
              :variant="appointmentStatusMap[appt.status].variant"
              size="sm"
              :dot="true"
            >
              {{ appointmentStatusMap[appt.status].label }}
            </AppBadge>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- ══════════════════ ROW 3: DONUT + QUICK ACTIONS ══════════════════ -->
    <div class="row-3">

      <!-- Patient Overview (Donut) -->
      <AppCard variant="default" class="donut-card">
        <template #header>
          <p class="text-card-title">Patient Overview</p>
        </template>

        <div class="donut-inner">
          <!-- SVG Donut -->
          <div class="donut-chart-wrap">
            <svg viewBox="0 0 160 160" width="160" height="160" class="donut-svg">
              <defs>
                <filter id="donutGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g v-for="seg in segments" :key="seg.name">
                <path
                  :d="seg.path"
                  fill="none"
                  :stroke="seg.color"
                  :stroke-width="DONUT_SW"
                  stroke-linecap="round"
                  filter="url(#donutGlow)"
                  class="donut-seg"
                />
              </g>
              <!-- Center label -->
              <text x="80" y="74" text-anchor="middle" font-size="22" font-weight="700" fill="#F4F8FC" font-family="Inter,system-ui,sans-serif">{{ total.toLocaleString() }}</text>
              <text x="80" y="92" text-anchor="middle" font-size="9" fill="#5D7187" font-family="Inter,system-ui,sans-serif" letter-spacing="0.06em">TOTAL PATIENTS</text>
            </svg>
          </div>

          <!-- Legend -->
          <div class="donut-legend">
            <div v-for="seg in segments" :key="seg.name" class="donut-legend-item">
              <span class="donut-legend-dot" :style="{ background: seg.color, boxShadow: `0 0 6px ${seg.color}` }" />
              <div class="donut-legend-info">
                <span class="donut-legend-label">{{ seg.name }}</span>
                <div class="donut-legend-right">
                  <span class="donut-legend-value">{{ seg.value.toLocaleString() }}</span>
                  <span class="donut-legend-pct text-muted">{{ seg.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Quick Actions -->
      <AppCard variant="default" class="quick-card">
        <template #header>
          <p class="text-card-title">Quick Actions</p>
        </template>

        <div class="quick-grid">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.id"
            :to="action.to"
            class="quick-action-item"
          >
            <div
              class="quick-action-icon"
              :style="{
                background: quickActionColors[action.variant].bg,
                color:      quickActionColors[action.variant].icon,
                boxShadow:  `0 0 20px ${quickActionColors[action.variant].glow}`,
              }"
              v-html="action.icon"
            />
            <div class="quick-action-text">
              <span class="quick-action-label">{{ action.label }}</span>
              <span class="quick-action-desc text-muted">{{ action.desc }}</span>
            </div>
            <span class="quick-action-arrow" v-html="arrowIcon" />
          </NuxtLink>
        </div>
      </AppCard>
    </div>

    <!-- ══════════════════ ROW 4: RECENT PATIENTS + FOLLOW-UP ══════════════════ -->
    <div class="row-4">

      <!-- Recent Patients Table -->
      <AppCard variant="default" padding="none" class="patients-card">
        <template #header>
          <div class="card-header-row" style="padding: 1.25rem 1.5rem 0;">
            <p class="text-card-title">Recent Patients</p>
            <NuxtLink to="/patients" class="view-link">
              View All Patients
              <span v-html="arrowIcon" class="view-link-icon" />
            </NuxtLink>
          </div>
        </template>

        <AppDataTable
          :columns="patientColumns"
          :rows="recentPatients"
          key-field="id"
        >
          <template #cell-name="{ row }">
            <div class="patient-cell">
              <AppAvatar :name="row.name" size="sm" />
              <span class="patient-cell-name">{{ row.name }}</span>
            </div>
          </template>

          <template #cell-status="{ row }">
            <AppBadge
              :variant="patientStatusMap[row.status as keyof typeof patientStatusMap]?.variant ?? 'neutral'"
              size="sm"
              :dot="true"
            >
              {{ patientStatusMap[row.status as keyof typeof patientStatusMap]?.label ?? row.status }}
            </AppBadge>
          </template>

          <template #cell-action>
            <button class="row-action-btn" :aria-label="'View patient'">
              <span v-html="eyeIcon" />
            </button>
          </template>
        </AppDataTable>
      </AppCard>

      <!-- Follow-up Reminders -->
      <AppCard variant="default" class="reminders-card">
        <template #header>
          <div class="card-header-row">
            <p class="text-card-title">Follow-up Reminders</p>
            <span class="reminder-count">{{ followUpReminders.length }}</span>
          </div>
        </template>

        <div class="reminders-list">
          <div
            v-for="rem in followUpReminders"
            :key="rem.id"
            class="reminder-item"
            :class="`reminder-${rem.urgency}`"
          >
            <div class="reminder-left">
              <div class="reminder-icon-wrap" :class="`reminder-icon-${rem.urgency}`">
                <span v-html="alertIcon" />
              </div>
              <div class="reminder-info">
                <span class="reminder-patient">{{ rem.patient }}</span>
                <span class="reminder-due text-muted">{{ rem.due }}</span>
              </div>
            </div>
            <button class="reminder-view-btn" aria-label="View patient">
              <span v-html="eyeIcon" />
              <span>View</span>
            </button>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- ══════════════════ ROW 5: RECENT ACTIVITY ══════════════════ -->
    <AppCard variant="default" class="activity-card">
      <template #header>
        <p class="text-card-title">Recent Activity</p>
      </template>
      <AppTimeline :items="recentActivity" />
    </AppCard>

  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   DASHBOARD LAYOUT
═══════════════════════════════════════════════ */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

/* ── Header ── */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.dash-header-left {
  display: flex;
  flex-direction: column;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.demo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 202, 99, 0.10);
  border: 1px solid rgba(255, 202, 99, 0.25);
  font-size: 0.75rem;
  font-weight: 500;
  color: #FFCA63;
  letter-spacing: 0.02em;
}

.demo-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #FFCA63;
  box-shadow: 0 0 6px #FFCA63;
  animation: pulse-glow 2s ease-in-out infinite;
}

.date-text {
  color: #5D7187;
  margin-left: 0.5rem;
}

.dash-header-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* ── Stat Grid ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* ── Row 2: Chart + Schedule ── */
.row-2 {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1rem;
  align-items: start;
}

.analytics-card { /* full width within grid cell */ }

/* Chart */
.chart-wrap {
  padding: 0.75rem 1rem 1rem;
  overflow: hidden;
}

.area-chart {
  width: 100%;
  height: auto;
  display: block;
}

.chart-area {
  transition: opacity 200ms ease;
}
.chart-line { transition: stroke 200ms ease; }
.chart-dot {
  transition: r 150ms ease;
}
.chart-dot-active {
  r: 5;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.legend-dot {
  width: 8px; height: 8px;
  border-radius: 9999px;
}

/* Schedule */
.schedule-list {
  display: flex;
  flex-direction: column;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  border-bottom: 1px solid rgba(100,190,255,0.06);
  transition: background 150ms ease;
  cursor: default;
}
.schedule-row:last-child { border-bottom: none; }

.schedule-time {
  flex-shrink: 0;
  width: 52px;
}
.time-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #28B9FF;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.schedule-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.schedule-patient {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F4F8FC;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.schedule-type {
  font-size: 0.75rem;
}

/* ── Row 3: Donut + Quick Actions ── */
.row-3 {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1rem;
  align-items: start;
}

/* Donut */
.donut-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.donut-chart-wrap {
  flex-shrink: 0;
}

.donut-svg {
  overflow: visible;
}

.donut-seg {
  transition: stroke-width 200ms ease, filter 200ms ease;
}
.donut-seg:hover { stroke-width: 24; }

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.donut-legend-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.donut-legend-dot {
  width: 8px; height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.donut-legend-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.donut-legend-label {
  font-size: 0.8125rem;
  color: #8FA3B8;
  font-weight: 500;
}
.donut-legend-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.donut-legend-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #F4F8FC;
  font-variant-numeric: tabular-nums;
}
.donut-legend-pct {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

/* Quick Actions */
.quick-grid {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  text-decoration: none;
  transition: background 150ms ease, box-shadow 150ms ease;
  cursor: pointer;
}
.quick-action-item:hover {
  background: rgba(100,190,255,0.05);
  box-shadow: inset 0 0 0 1px rgba(100,190,255,0.12);
}
.quick-action-item:hover .quick-action-arrow {
  color: #28B9FF;
  transform: translateX(2px);
}

.quick-action-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.quick-action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.quick-action-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F4F8FC;
}
.quick-action-desc {
  font-size: 0.75rem;
}
.quick-action-arrow {
  display: flex;
  color: #5D7187;
  transition: color 150ms ease, transform 150ms ease;
}

/* ── Row 4: Table + Reminders ── */
.row-4 {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1rem;
  align-items: start;
}

/* Patient cell */
.patient-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.patient-cell-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F4F8FC;
}

.row-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: 7px;
  border: 1px solid rgba(100,190,255,0.14);
  background: transparent;
  color: #5D7187;
  cursor: pointer;
  transition: all 150ms ease;
  margin: 0 auto;
}
.row-action-btn:hover {
  background: rgba(40,185,255,0.08);
  color: #28B9FF;
  border-color: rgba(40,185,255,0.30);
}

/* Reminders */
.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.reminder-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 150ms ease;
}

.reminder-danger  { background: rgba(255,102,122,0.06); border-color: rgba(255,102,122,0.15); }
.reminder-warning { background: rgba(255,202,99,0.06);  border-color: rgba(255,202,99,0.15); }
.reminder-primary { background: rgba(40,185,255,0.05);  border-color: rgba(40,185,255,0.12); }

.reminder-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.reminder-icon-wrap {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.reminder-icon-danger  { background: rgba(255,102,122,0.15); color: #FF667A; }
.reminder-icon-warning { background: rgba(255,202,99,0.15);  color: #FFCA63; }
.reminder-icon-primary { background: rgba(40,185,255,0.15);  color: #28B9FF; }

.reminder-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.reminder-patient {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F4F8FC;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.reminder-due {
  font-size: 0.75rem;
}

.reminder-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(100,190,255,0.20);
  background: transparent;
  color: #8FA3B8;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 150ms ease;
  font-family: 'Inter', system-ui, sans-serif;
}
.reminder-view-btn:hover {
  background: rgba(40,185,255,0.08);
  color: #28B9FF;
  border-color: rgba(40,185,255,0.30);
}

.reminder-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 9999px;
  background: rgba(255,102,122,0.15);
  border: 1px solid rgba(255,102,122,0.30);
  color: #FF667A;
  font-size: 0.7rem;
  font-weight: 600;
}

/* ── Card header row ── */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* ── View link ── */
.view-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #28B9FF;
  text-decoration: none;
  font-weight: 500;
  transition: color 150ms ease, gap 150ms ease;
  flex-shrink: 0;
}
.view-link:hover {
  color: #58D6FF;
  gap: 0.5rem;
}
.view-link-icon {
  display: flex;
  transition: transform 150ms ease;
}
.view-link:hover .view-link-icon {
  transform: translateX(2px);
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */

/* Tablet: ≤ 1200px */
@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .row-2 {
    grid-template-columns: 1fr;
  }
  .row-3 {
    grid-template-columns: 1fr 1fr;
  }
  .row-4 {
    grid-template-columns: 1fr;
  }
}

/* Tablet small: ≤ 900px */
@media (max-width: 900px) {
  .row-3 {
    grid-template-columns: 1fr;
  }
  .donut-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Mobile: ≤ 640px */
@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .dash-header {
    flex-direction: column;
  }
  .dash-header-actions {
    width: 100%;
  }
  .header-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .row-3 {
    grid-template-columns: 1fr;
  }
}
</style>
