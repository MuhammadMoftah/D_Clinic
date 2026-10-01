<script setup lang="ts">
useHead({ title: 'Dashboard — Dr. Dalia Clinic' })

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const statCards = [
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`, title: "Today's Patients", value: '24', change: 12, variant: 'primary' as const },
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, title: 'Appointments', value: '18', change: -3, variant: 'warning' as const },
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, title: 'Completed Visits', value: '15', change: 8, variant: 'success' as const },
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`, title: "Monthly Revenue", value: '12,450', change: 15, variant: 'info' as const },
]

const recentPatients = [
  { id: 1, name: 'Ahmed Hassan',    age: 45, status: 'active',    time: '10:30 AM' },
  { id: 2, name: 'Sara Mohammed',  age: 32, status: 'pending',   time: '11:00 AM' },
  { id: 3, name: 'Khaled Ibrahim', age: 58, status: 'completed', time: '11:45 AM' },
  { id: 4, name: 'Fatima Al-Ali',  age: 27, status: 'cancelled', time: '12:00 PM' },
  { id: 5, name: 'Omar Saleh',     age: 63, status: 'active',    time: '01:30 PM' },
]

const statusMap: Record<string, { variant: 'success' | 'warning' | 'primary' | 'danger' | 'neutral', label: string }> = {
  active:    { variant: 'success', label: 'Active' },
  pending:   { variant: 'warning', label: 'Pending' },
  completed: { variant: 'primary', label: 'Completed' },
  cancelled: { variant: 'danger',  label: 'Cancelled' },
}

const timelineItems = [
  { id: 1, time: '10:30 AM', title: 'Consultation — Ahmed Hassan',  description: 'Routine checkup completed', variant: 'success' as const },
  { id: 2, time: '09:45 AM', title: 'Lab Results — Sara Mohammed',  description: 'CBC panel uploaded and reviewed', variant: 'primary' as const },
  { id: 3, time: '09:00 AM', title: 'Appointment — Khaled Ibrahim', description: 'Follow-up visit scheduled', variant: 'neutral' as const },
  { id: 4, time: '08:30 AM', title: 'Payment Received',             description: 'EGP 850 from Fatima Al-Ali',   variant: 'warning' as const },
]
</script>

<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="dash-header">
      <div>
        <h1 class="text-page-title">Good morning, Dr. Dalia 👋</h1>
        <p class="text-muted" style="margin-top: 0.25rem;">{{ today }}</p>
      </div>
      <AppButton variant="primary"
        icon-left='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
      >New Appointment</AppButton>
    </div>

    <!-- Stat Cards -->
    <div class="stat-grid">
      <AppStatCard
        v-for="s in statCards"
        :key="s.title"
        :icon="s.icon"
        :title="s.title"
        :value="s.value"
        :change="s.change"
        :variant="s.variant"
        change-label="vs yesterday"
      />
    </div>

    <!-- Main Grid -->
    <div class="dash-grid">
      <!-- Recent Patients -->
      <AppCard variant="default" padding="none" class="col-span-2">
        <template #header>
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 1.25rem;">
            <span class="text-card-title">Today's Patients</span>
            <NuxtLink to="/patients" class="view-link">View All →</NuxtLink>
          </div>
        </template>
        <div>
          <div
            v-for="p in recentPatients"
            :key="p.id"
            class="patient-row row-hover"
          >
            <AppAvatar :name="p.name" size="sm" />
            <div class="patient-info">
              <span class="patient-name">{{ p.name }}</span>
              <span class="patient-age text-muted">Age {{ p.age }}</span>
            </div>
            <AppBadge :variant="statusMap[p.status]?.variant ?? 'neutral'" :dot="true" size="sm">
              {{ statusMap[p.status]?.label ?? p.status }}
            </AppBadge>
            <span class="patient-time text-caption">{{ p.time }}</span>
          </div>
        </div>
      </AppCard>

      <!-- Activity Feed -->
      <AppCard variant="default">
        <template #header>
          <span class="text-card-title">Activity Feed</span>
        </template>
        <AppTimeline :items="timelineItems" />
      </AppCard>

      <!-- Progress Overview -->
      <AppCard variant="default">
        <template #header>
          <span class="text-card-title">Today's Overview</span>
        </template>
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <AppProgress :value="63" variant="primary" size="md" :show-label="true" label="Appointments Completed" />
          <AppProgress :value="82" variant="success" size="md" :show-label="true" label="Patient Satisfaction" />
          <AppProgress :value="45" variant="warning" size="md" :show-label="true" label="Clinic Capacity" />
        </div>
        <div style="display:flex; justify-content:center; gap:2rem; margin-top:1.5rem;">
          <AppProgressRing :value="63" variant="primary" :size="80" label="Completed" />
          <AppProgressRing :value="82" variant="success" :size="80" label="Satisfied" />
          <AppProgressRing :value="45" variant="warning" :size="80" label="Capacity" />
        </div>
      </AppCard>
    </div>

    <!-- Quick Actions -->
    <AppCard variant="default">
      <template #header><span class="text-card-title">Quick Actions</span></template>
      <div class="quick-actions">
        <AppButton variant="outline" size="sm">📋 New Visit</AppButton>
        <AppButton variant="outline" size="sm">💊 Add Prescription</AppButton>
        <AppButton variant="outline" size="sm">🧪 Order Investigation</AppButton>
        <AppButton variant="outline" size="sm">💳 Record Payment</AppButton>
        <AppButton variant="outline" size="sm">📁 Upload File</AppButton>
        <AppButton variant="outline" size="sm">📞 Send Reminder</AppButton>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 1.5rem; }

.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.col-span-2 { grid-column: span 2; }

/* Patient row */
.patient-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(100,190,255,0.06);
  cursor: pointer;
}
.patient-row:last-child { border-bottom: none; }
.patient-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.patient-name { font-size: 0.875rem; font-weight: 500; color: #F4F8FC; }
.patient-age  { font-size: 0.75rem; }
.patient-time { flex-shrink: 0; }

.view-link {
  font-size: 0.8125rem;
  color: #28B9FF;
  text-decoration: none;
  font-weight: 500;
  transition: color 150ms ease;
}
.view-link:hover { color: #58D6FF; }

.quick-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }

@media (max-width: 900px) {
  .dash-grid { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: span 1; }
}
</style>
