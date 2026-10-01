<script setup lang="ts">
useHead({ title: 'UI Components — Dr. Dalia Clinic' })

// ── Toast demo ──
const toast = useToast()

// ── Modal demo ──
const modalOpen = ref(false)
const drawerOpen = ref(false)
const confirmOpen = ref(false)

// ── Form state ──
const inputValue = ref('')
const textareaValue = ref('')
const selectValue = ref<string | null>(null)
const searchValue = ref('')
const switchValue = ref(true)
const checkboxValue = ref(false)
const radioValue = ref('option1')
const passwordValue = ref('')

// ── Table ──
const tableColumns = [
  { key: 'name',   label: 'Patient Name', sortable: true },
  { key: 'age',    label: 'Age',          sortable: true, align: 'center' as const, width: '80px' },
  { key: 'status', label: 'Status',       width: '120px' },
  { key: 'visit',  label: 'Last Visit' },
]

const tableRows = [
  { id: 1, name: 'Ahmed Hassan',    age: 45, status: 'active',    visit: '2026-09-28' },
  { id: 2, name: 'Sara Mohammed',  age: 32, status: 'pending',   visit: '2026-09-25' },
  { id: 3, name: 'Khaled Ibrahim', age: 58, status: 'completed', visit: '2026-09-20' },
  { id: 4, name: 'Fatima Al-Ali',  age: 27, status: 'cancelled', visit: '2026-09-18' },
  { id: 5, name: 'Omar Saleh',     age: 63, status: 'active',    visit: '2026-09-15' },
]

const statusMap: Record<string, { variant: 'success' | 'warning' | 'primary' | 'danger', label: string }> = {
  active:    { variant: 'success', label: 'Active' },
  pending:   { variant: 'warning', label: 'Pending' },
  completed: { variant: 'primary', label: 'Completed' },
  cancelled: { variant: 'danger',  label: 'Cancelled' },
}

const selectedRows = ref<typeof tableRows>([])
const tableLoading = ref(false)

// ── Tabs ──
const activeTab = ref('overview')
const tabs = [
  { key: 'overview',    label: 'Overview',     badge: 3 },
  { key: 'visits',      label: 'Visits' },
  { key: 'medications', label: 'Medications' },
  { key: 'disabled',    label: 'Archived',     disabled: true },
]

// ── Pagination ──
const currentPage = ref(1)

// ── Timeline ──
const timelineItems = [
  { id: 1, time: '10:30 AM', title: 'Consultation completed',    description: 'Patient discharged after routine check', variant: 'success' as const },
  { id: 2, time: '09:45 AM', title: 'Lab results uploaded',      description: 'CBC and Metabolic panel received',        variant: 'primary' as const },
  { id: 3, time: '09:00 AM', title: 'Patient arrived',           description: 'Registration completed at reception',     variant: 'neutral' as const },
  { id: 4, time: 'Yesterday', title: 'Follow-up scheduled',      description: 'Appointment set for next week',           variant: 'warning' as const },
]

// ── Stat cards ──
const statCards = [
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`, title: "Today's Patients", value: '24',  change: 12,  variant: 'primary' as const },
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, title: "Appointments", value: '18', change: -3, variant: 'warning' as const },
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, title: 'Completed Visits', value: '15', change: 8, variant: 'success' as const },
  { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`, title: 'Monthly Revenue', value: '12,450', change: 15, variant: 'info' as const },
]

// ── Select options ──
const selectOptions = [
  { value: 'general', label: 'General Medicine' },
  { value: 'cardio',  label: 'Cardiology' },
  { value: 'ortho',   label: 'Orthopedics', disabled: true },
  { value: 'neuro',   label: 'Neurology' },
]

// ── Dropdown items ──
const dropdownItems = [
  { key: 'edit',   label: 'Edit',        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>` },
  { key: 'view',   label: 'View Details', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` },
  { key: 'sep',    label: '', separator: true },
  { key: 'delete', label: 'Delete',       icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`, variant: 'danger' as const },
]

// ── Avatar group ──
const avatarGroup = [
  { name: 'Ahmed Hassan' },
  { name: 'Sara Mohammed' },
  { name: 'Khaled Ibrahim' },
  { name: 'Fatima Al-Ali' },
  { name: 'Omar Saleh' },
  { name: 'Nour Adel' },
]

// ── Nav sections for sidebar ──
const sections = [
  { id: 'colors',       label: '🎨 Colors' },
  { id: 'typography',   label: '🔤 Typography' },
  { id: 'buttons',      label: '🔘 Buttons' },
  { id: 'badges',       label: '🏷️ Badges' },
  { id: 'cards',        label: '🃏 Cards' },
  { id: 'alerts',       label: '⚠️ Alerts' },
  { id: 'inputs',       label: '📝 Inputs' },
  { id: 'switches',     label: '🔛 Switches' },
  { id: 'avatars',      label: '👤 Avatars' },
  { id: 'progress',     label: '📊 Progress' },
  { id: 'stats',        label: '📈 Stat Cards' },
  { id: 'table',        label: '📋 Table' },
  { id: 'tabs',         label: '🗂️ Tabs' },
  { id: 'timeline',     label: '🕐 Timeline' },
  { id: 'modals',       label: '🪟 Modals' },
  { id: 'dropdowns',    label: '📂 Dropdowns' },
  { id: 'pagination',   label: '📄 Pagination' },
  { id: 'loading',      label: '⏳ Loading' },
  { id: 'toasts',       label: '🔔 Toasts' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function simulateTableLoading() {
  tableLoading.value = true
  setTimeout(() => { tableLoading.value = false }, 2000)
}
</script>

<template>
  <div class="components-page">
    <!-- ── Page Header ── -->
    <div class="page-header">
      <div>
        <h1 class="text-page-title gradient-text-primary">UI Components</h1>
        <p class="text-secondary" style="margin-top: 0.25rem;">Dr. Dalia Clinic · Design System</p>
      </div>
      <AppBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Components' }]" />
    </div>

    <div class="components-layout">
      <!-- ── Section Nav (sticky) ── -->
      <aside class="section-nav">
        <div class="glass-panel" style="padding: 0.75rem; position: sticky; top: 1rem;">
          <p class="text-label" style="padding: 0.25rem 0.5rem; margin-bottom: 0.5rem;">Sections</p>
          <button
            v-for="s in sections"
            :key="s.id"
            class="section-nav-btn"
            @click="scrollTo(s.id)"
          >{{ s.label }}</button>
        </div>
      </aside>

      <!-- ── Content ── -->
      <div class="components-content">

        <!-- ════════════════════════════════════════
             COLORS
        ════════════════════════════════════════ -->
        <section id="colors" class="ds-section">
          <h2 class="ds-section-title">Colors</h2>
          <p class="ds-section-desc">Centralized design tokens. Never hardcode colors — always reference CSS custom properties.</p>
          <div class="color-grid">
            <div v-for="c in [
              { name:'Primary',    hex:'#28B9FF', var:'--color-primary' },
              { name:'Primary Lt', hex:'#58D6FF', var:'--color-primary-light' },
              { name:'Primary Dk', hex:'#1688D4', var:'--color-primary-dark' },
              { name:'Blue',       hex:'#327CFF', var:'--color-blue' },
              { name:'Success',    hex:'#35D39A', var:'--color-success' },
              { name:'Warning',    hex:'#FFCA63', var:'--color-warning' },
              { name:'Danger',     hex:'#FF667A', var:'--color-danger' },
              { name:'Info',       hex:'#4DB8FF', var:'--color-info' },
              { name:'BG',         hex:'#050B14', var:'--color-background', dark: true },
              { name:'Surface',    hex:'#0C1B2B', var:'--color-surface-solid', dark: true },
              { name:'Text Pri',   hex:'#F4F8FC', var:'--color-text-primary', dark: true },
              { name:'Text Sec',   hex:'#8FA3B8', var:'--color-text-secondary', dark: true },
            ]" :key="c.name" class="color-swatch">
              <div class="swatch-block" :style="{ background: c.hex, border: c.dark ? '1px solid rgba(100,190,255,0.20)' : 'none' }" />
              <div class="swatch-info">
                <span class="swatch-name">{{ c.name }}</span>
                <span class="text-mono text-muted">{{ c.hex }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             TYPOGRAPHY
        ════════════════════════════════════════ -->
        <section id="typography" class="ds-section">
          <h2 class="ds-section-title">Typography</h2>
          <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Display</span><p class="text-display">Premium Medical SaaS</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Page Title</span><p class="text-page-title">Patient Dashboard</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Section Title</span><p class="text-section-title">Recent Visits</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Card Title</span><p class="text-card-title">Ahmed Hassan — Consultation</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Body</span><p class="text-body">Patient reported mild chest discomfort lasting 2 days. No history of cardiac events. Referred for ECG.</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Secondary</span><p class="text-secondary">Last updated 5 minutes ago</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Muted / Caption</span><p class="text-muted">This field is optional. Maximum 500 characters.</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Label</span><p class="text-label">Patient Status</p></div>
            <AppDivider />
            <div><span class="text-label" style="display:block; margin-bottom:4px;">Gradient Text</span><p class="text-page-title gradient-text-primary">Dr. Dalia Clinic</p></div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             BUTTONS
        ════════════════════════════════════════ -->
        <section id="buttons" class="ds-section">
          <h2 class="ds-section-title">Buttons</h2>

          <div class="ds-subsection">
            <h3 class="ds-sub-title">Variants</h3>
            <div class="flex-wrap-row">
              <AppButton variant="primary">Add Patient</AppButton>
              <AppButton variant="secondary">Cancel</AppButton>
              <AppButton variant="outline">View Details</AppButton>
              <AppButton variant="ghost">Dismiss</AppButton>
              <AppButton variant="danger">Delete Record</AppButton>
              <AppButton variant="success">Confirm Visit</AppButton>
              <AppButton variant="warning">Review Flag</AppButton>
              <AppButton variant="link">Learn more →</AppButton>
            </div>
          </div>

          <div class="ds-subsection">
            <h3 class="ds-sub-title">Sizes</h3>
            <div class="flex-wrap-row" style="align-items: center;">
              <AppButton variant="primary" size="xs">Extra Small</AppButton>
              <AppButton variant="primary" size="sm">Small</AppButton>
              <AppButton variant="primary" size="md">Medium</AppButton>
              <AppButton variant="primary" size="lg">Large</AppButton>
              <AppButton variant="primary" size="xl">Extra Large</AppButton>
            </div>
          </div>

          <div class="ds-subsection">
            <h3 class="ds-sub-title">States</h3>
            <div class="flex-wrap-row">
              <AppButton variant="primary" :loading="true">Saving...</AppButton>
              <AppButton variant="primary" :disabled="true">Disabled</AppButton>
              <AppButton variant="outline"
                icon-left='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
              >New Appointment</AppButton>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             BADGES
        ════════════════════════════════════════ -->
        <section id="badges" class="ds-section">
          <h2 class="ds-section-title">Badges</h2>
          <div class="ds-subsection">
            <h3 class="ds-sub-title">Variants</h3>
            <div class="flex-wrap-row" style="align-items:center;">
              <AppBadge variant="primary"  :dot="true">Active</AppBadge>
              <AppBadge variant="warning"  :dot="true">Pending</AppBadge>
              <AppBadge variant="success"  :dot="true">Confirmed</AppBadge>
              <AppBadge variant="neutral"  :dot="true">No Show</AppBadge>
              <AppBadge variant="danger"   :dot="true">Cancelled</AppBadge>
              <AppBadge variant="info">Paid</AppBadge>
              <AppBadge variant="neutral">Unpaid</AppBadge>
              <AppBadge variant="success">Completed</AppBadge>
            </div>
          </div>
          <div class="ds-subsection">
            <h3 class="ds-sub-title">Sizes</h3>
            <div class="flex-wrap-row" style="align-items:center;">
              <AppBadge size="sm" variant="primary">Small</AppBadge>
              <AppBadge size="md" variant="primary">Medium</AppBadge>
              <AppBadge size="lg" variant="primary">Large</AppBadge>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             CARDS
        ════════════════════════════════════════ -->
        <section id="cards" class="ds-section">
          <h2 class="ds-section-title">Cards</h2>
          <div class="card-grid">
            <AppCard variant="default">
              <p class="text-card-title">Default Card</p>
              <p class="text-secondary" style="margin-top:0.5rem;">Standard glass surface with subtle border and shadow.</p>
            </AppCard>
            <AppCard variant="elevated">
              <p class="text-card-title">Elevated Card</p>
              <p class="text-secondary" style="margin-top:0.5rem;">Higher z-shadow and glow for important content.</p>
            </AppCard>
            <AppCard variant="interactive">
              <p class="text-card-title">Interactive Card</p>
              <p class="text-secondary" style="margin-top:0.5rem;">Hover to see lift effect. Use for clickable items.</p>
            </AppCard>
            <AppCard variant="selected">
              <p class="text-card-title">Selected Card</p>
              <p class="text-secondary" style="margin-top:0.5rem;">Shows cyan border and glow when selected.</p>
            </AppCard>
            <AppCard variant="bordered">
              <p class="text-card-title">Bordered Card</p>
              <p class="text-secondary" style="margin-top:0.5rem;">Solid background, stronger border definition.</p>
            </AppCard>
            <AppCard variant="default">
              <template #header>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <span class="text-card-title">With Header & Footer</span>
                  <AppBadge variant="success" size="sm">Active</AppBadge>
                </div>
              </template>
              <p class="text-secondary">This card uses header and footer slots.</p>
              <template #footer>
                <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
                  <AppButton size="sm" variant="ghost">Cancel</AppButton>
                  <AppButton size="sm" variant="primary">Save</AppButton>
                </div>
              </template>
            </AppCard>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             ALERTS
        ════════════════════════════════════════ -->
        <section id="alerts" class="ds-section">
          <h2 class="ds-section-title">Alerts</h2>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <AppAlert variant="info"    title="Lab Results Ready"    :closable="true">Patient CBC results are now available for review in the investigations tab.</AppAlert>
            <AppAlert variant="success" title="Appointment Confirmed" :closable="true">Appointment with Ahmed Hassan has been successfully confirmed for 2:30 PM.</AppAlert>
            <AppAlert variant="warning" title="Unpaid Balance"        :closable="true">Patient has an outstanding balance of EGP 450. Please collect payment before the visit.</AppAlert>
            <AppAlert variant="danger"  title="Critical Allergy"      :closable="false">Patient is allergic to Penicillin. Do not prescribe this medication.</AppAlert>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             INPUTS
        ════════════════════════════════════════ -->
        <section id="inputs" class="ds-section">
          <h2 class="ds-section-title">Form Inputs</h2>
          <div class="input-grid">
            <AppInput v-model="inputValue" label="Patient Name" placeholder="Enter full name" :required="true" />
            <AppInput label="Email Address" placeholder="patient@example.com" type="email"
              icon-left='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
            />
            <AppInput label="Phone Number" placeholder="+20 xxx xxx xxxx" prefix="+20" type="tel" />
            <AppInput label="Error State" placeholder="Enter value" error="This field is required" />
            <AppInput label="Success State" placeholder="Enter value" success="Looks good!" model-value="Ahmed Hassan" />
            <AppInput label="With Helper" placeholder="Enter value" helper="This will be shown on the patient record" />
            <AppInput label="Disabled" placeholder="Cannot edit" :disabled="true" />
            <AppInput label="With Suffix" placeholder="0.00" suffix="EGP" type="number" />
            <AppPasswordInput v-model="passwordValue" label="Password" />
            <AppSearch v-model="searchValue" placeholder="Search patients..." :debounce="300" />
            <AppTextarea v-model="textareaValue" label="Visit Notes" placeholder="Enter clinical notes..." :rows="3" :max-length="500" :show-count="true" />
            <AppSelect v-model="selectValue" :options="selectOptions" label="Specialty" placeholder="Select specialty" />
          </div>
        </section>

        <!-- ════════════════════════════════════════
             SWITCHES / CHECKBOXES / RADIO
        ════════════════════════════════════════ -->
        <section id="switches" class="ds-section">
          <h2 class="ds-section-title">Switches, Checkboxes & Radio</h2>
          <div class="card-grid" style="grid-template-columns: 1fr 1fr 1fr;">
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom: 1rem;">Switches</p>
              <div style="display:flex; flex-direction:column; gap:1rem;">
                <AppSwitch v-model="switchValue" label="Enable Reminders" description="Send SMS reminders to patients" />
                <AppSwitch :model-value="false" label="Dark Mode" />
                <AppSwitch :model-value="true" :disabled="true" label="Auto-backup (locked)" />
              </div>
            </AppCard>
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom: 1rem;">Checkboxes</p>
              <div style="display:flex; flex-direction:column; gap:1rem;">
                <AppCheckbox v-model="checkboxValue" label="Send email notification" description="Patient will receive confirmation" />
                <AppCheckbox :model-value="true" label="Mark as urgent" />
                <AppCheckbox :model-value="false" :indeterminate="true" label="Mixed selection" />
                <AppCheckbox :model-value="false" :disabled="true" label="Disabled option" />
              </div>
            </AppCard>
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom: 1rem;">Radio Buttons</p>
              <div style="display:flex; flex-direction:column; gap:1rem;">
                <AppRadio v-model="radioValue" value="option1" name="demo-radio" label="Morning Shift" description="8:00 AM – 2:00 PM" />
                <AppRadio v-model="radioValue" value="option2" name="demo-radio" label="Evening Shift" description="2:00 PM – 8:00 PM" />
                <AppRadio v-model="radioValue" value="option3" name="demo-radio" label="Night Shift" description="8:00 PM – 8:00 AM" :disabled="true" />
              </div>
            </AppCard>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             AVATARS
        ════════════════════════════════════════ -->
        <section id="avatars" class="ds-section">
          <h2 class="ds-section-title">Avatars</h2>
          <div class="ds-subsection">
            <h3 class="ds-sub-title">Sizes</h3>
            <div class="flex-wrap-row" style="align-items:center;">
              <AppAvatar name="Ahmed Hassan" size="xs" />
              <AppAvatar name="Sara Mohammed" size="sm" />
              <AppAvatar name="Khaled Ibrahim" size="md" />
              <AppAvatar name="Fatima Al-Ali" size="lg" />
              <AppAvatar name="Omar Saleh" size="xl" />
            </div>
          </div>
          <div class="ds-subsection">
            <h3 class="ds-sub-title">With Status</h3>
            <div class="flex-wrap-row" style="align-items:center;">
              <AppAvatar name="Dr. Dalia" size="md" status="online" />
              <AppAvatar name="Dr. Ahmed" size="md" status="busy" />
              <AppAvatar name="Dr. Sara"  size="md" status="away" />
              <AppAvatar name="Dr. Omar"  size="md" status="offline" />
            </div>
          </div>
          <div class="ds-subsection">
            <h3 class="ds-sub-title">Avatar Group</h3>
            <AppAvatarGroup :avatars="avatarGroup" :max="4" size="md" />
          </div>
        </section>

        <!-- ════════════════════════════════════════
             PROGRESS
        ════════════════════════════════════════ -->
        <section id="progress" class="ds-section">
          <h2 class="ds-section-title">Progress</h2>
          <div class="card-grid" style="grid-template-columns: 1fr 1fr;">
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom:1rem;">Progress Bars</p>
              <div style="display:flex; flex-direction:column; gap:1rem;">
                <AppProgress :value="72" variant="primary" size="md" :show-label="true" label="Treatment Progress" />
                <AppProgress :value="48" variant="success" size="sm" :show-label="true" label="Goals Achieved" />
                <AppProgress :value="88" variant="warning" size="md" :show-label="true" label="Capacity Used" />
                <AppProgress :value="31" variant="danger"  size="lg" :show-label="true" label="Risk Level" />
              </div>
            </AppCard>
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom:1rem;">Progress Rings</p>
              <div class="flex-wrap-row" style="justify-content:center; gap:1.5rem;">
                <AppProgressRing :value="72" variant="primary" :size="80" label="Recovery" />
                <AppProgressRing :value="48" variant="success" :size="80" label="Goals" />
                <AppProgressRing :value="88" variant="warning" :size="80" label="Load" />
                <AppProgressRing :value="31" variant="danger"  :size="80" label="Risk" />
              </div>
            </AppCard>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             STAT CARDS
        ════════════════════════════════════════ -->
        <section id="stats" class="ds-section">
          <h2 class="ds-section-title">Stat Cards</h2>
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
          <div class="stat-grid" style="margin-top:1rem;">
            <AppStatCard title="Loading State" :loading="true" variant="primary" />
            <AppStatCard icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' title="Follow-ups Due" value="7" :change="0" variant="warning" description="3 overdue" />
          </div>
        </section>

        <!-- ════════════════════════════════════════
             TABLE
        ════════════════════════════════════════ -->
        <section id="table" class="ds-section">
          <h2 class="ds-section-title">Data Table</h2>
          <AppCard variant="default" padding="none">
            <div style="display:flex; align-items:center; justify-content:space-between; padding: 1.25rem 1.25rem 0.75rem;">
              <span class="text-card-title">Patients</span>
              <div style="display:flex; gap:0.75rem; align-items:center;">
                <AppSearch v-model="searchValue" placeholder="Search..." style="width: 200px;" />
                <AppButton size="sm" variant="primary"
                  icon-left='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
                >Add Patient</AppButton>
                <AppButton size="sm" variant="secondary" @click="simulateTableLoading">Reload</AppButton>
              </div>
            </div>

            <AppDataTable
              :columns="tableColumns"
              :rows="tableRows"
              :loading="tableLoading"
              :selectable="true"
              v-model="selectedRows"
              key-field="id"
              empty-title="No patients found"
              empty-description="Add your first patient to get started."
            >
              <template #cell-status="{ value }">
                <AppBadge :variant="statusMap[value]?.variant ?? 'neutral'" :dot="true" size="sm">
                  {{ statusMap[value]?.label ?? value }}
                </AppBadge>
              </template>
            </AppDataTable>

            <div style="display:flex; align-items:center; justify-content:space-between; padding: 0.875rem 1.25rem; border-top: 1px solid rgba(100,190,255,0.08);">
              <span class="text-caption">{{ selectedRows.length ? `${selectedRows.length} row(s) selected` : `Showing ${tableRows.length} of ${tableRows.length}` }}</span>
              <AppPagination v-model="currentPage" :total="50" :per-page="10" />
            </div>
          </AppCard>
        </section>

        <!-- ════════════════════════════════════════
             TABS
        ════════════════════════════════════════ -->
        <section id="tabs" class="ds-section">
          <h2 class="ds-section-title">Tabs</h2>
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <div>
              <p class="ds-sub-title" style="margin-bottom:0.75rem;">Pill (default)</p>
              <AppTabs v-model="activeTab" :tabs="tabs" variant="pill">
                <div class="glass-card" style="padding:1.5rem; margin-top:0.5rem;">
                  <p class="text-secondary">Active: <strong style="color:#28B9FF;">{{ activeTab }}</strong></p>
                </div>
              </AppTabs>
            </div>
            <div>
              <p class="ds-sub-title" style="margin-bottom:0.75rem;">Underline</p>
              <AppTabs v-model="activeTab" :tabs="tabs" variant="underline">
                <div style="padding-top:0.75rem;">
                  <p class="text-secondary">Active tab: {{ activeTab }}</p>
                </div>
              </AppTabs>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             TIMELINE
        ════════════════════════════════════════ -->
        <section id="timeline" class="ds-section">
          <h2 class="ds-section-title">Timeline</h2>
          <AppCard variant="default" style="max-width: 500px;">
            <AppTimeline :items="timelineItems" />
          </AppCard>
        </section>

        <!-- ════════════════════════════════════════
             MODALS & DRAWERS
        ════════════════════════════════════════ -->
        <section id="modals" class="ds-section">
          <h2 class="ds-section-title">Modals & Drawers</h2>
          <div class="flex-wrap-row">
            <AppButton variant="primary"    @click="modalOpen = true">Open Modal</AppButton>
            <AppButton variant="secondary"  @click="drawerOpen = true">Open Drawer</AppButton>
            <AppButton variant="danger"     @click="confirmOpen = true">Delete (Confirm Dialog)</AppButton>
          </div>

          <AppModal v-model="modalOpen" title="Add New Patient" size="md">
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <AppInput label="Full Name" placeholder="Enter patient name" :required="true" />
              <AppInput label="Date of Birth" type="text" placeholder="DD/MM/YYYY" />
              <AppSelect :options="selectOptions" label="Specialty" placeholder="Select specialty" />
            </div>
            <template #footer>
              <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
              <AppButton variant="primary" @click="modalOpen = false">Save Patient</AppButton>
            </template>
          </AppModal>

          <AppDrawer v-model="drawerOpen" title="Patient Details" side="right" size="md">
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <AppStatCard title="Total Visits" value="14" variant="primary" :change="3" />
              <AppTimeline :items="timelineItems" />
            </div>
            <template #footer>
              <AppButton variant="ghost" @click="drawerOpen = false">Close</AppButton>
              <AppButton variant="primary">Edit Patient</AppButton>
            </template>
          </AppDrawer>

          <AppConfirmDialog
            v-model="confirmOpen"
            title="Delete Patient Record"
            message="This will permanently remove the patient and all their data. This action cannot be undone."
            confirm-label="Yes, Delete"
            variant="danger"
            @confirm="confirmOpen = false; toast.error('Patient deleted', 'Deleted')"
            @cancel="confirmOpen = false"
          />
        </section>

        <!-- ════════════════════════════════════════
             DROPDOWNS
        ════════════════════════════════════════ -->
        <section id="dropdowns" class="ds-section">
          <h2 class="ds-section-title">Dropdowns</h2>
          <div class="flex-wrap-row">
            <AppDropdown :items="dropdownItems" @select="(k) => toast.info(`Selected: ${k}`)">
              <template #trigger>
                <AppButton variant="secondary">Actions ▾</AppButton>
              </template>
            </AppDropdown>
            <AppDropdown :items="dropdownItems" align="right" @select="(k) => toast.info(`Selected: ${k}`)">
              <template #trigger>
                <AppButton variant="outline">Right Aligned ▾</AppButton>
              </template>
            </AppDropdown>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             PAGINATION
        ════════════════════════════════════════ -->
        <section id="pagination" class="ds-section">
          <h2 class="ds-section-title">Pagination</h2>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            <div class="flex-wrap-row" style="align-items:center; gap:1rem;">
              <span class="text-secondary">Page {{ currentPage }} of 5</span>
              <AppPagination v-model="currentPage" :total="50" :per-page="10" />
            </div>
            <div class="flex-wrap-row" style="align-items:center; gap:1rem;">
              <AppPagination v-model="currentPage" :total="250" :per-page="10" />
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             LOADING STATES
        ════════════════════════════════════════ -->
        <section id="loading" class="ds-section">
          <h2 class="ds-section-title">Loading States</h2>
          <div class="card-grid" style="grid-template-columns: repeat(3, 1fr);">
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom:1rem;">Spinners</p>
              <div class="flex-wrap-row" style="align-items:center; justify-content:center; gap:1.5rem;">
                <AppSpinner size="sm" />
                <AppSpinner size="md" />
                <AppSpinner size="lg" />
              </div>
            </AppCard>
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom:1rem;">Skeleton</p>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                <AppSkeleton height="12px" width="60%" />
                <AppSkeleton height="24px" />
                <AppSkeleton height="12px" width="80%" />
                <AppSkeleton height="12px" width="40%" />
                <AppSkeleton height="80px" rounded="12px" style="margin-top:0.5rem;" />
              </div>
            </AppCard>
            <AppCard variant="default">
              <p class="text-card-title" style="margin-bottom:1rem;">Empty State</p>
              <AppEmptyState title="No Results" description="Try adjusting your search filters." action-label="Clear Filters" @action="searchValue = ''" />
            </AppCard>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             TOASTS
        ════════════════════════════════════════ -->
        <section id="toasts" class="ds-section">
          <h2 class="ds-section-title">Toasts</h2>
          <div class="flex-wrap-row">
            <AppButton variant="primary"   @click="toast.info('Lab results are ready for review', 'Lab Results')">Info Toast</AppButton>
            <AppButton variant="success"   @click="toast.success('Appointment confirmed for 2:30 PM', 'Confirmed!')">Success Toast</AppButton>
            <AppButton variant="warning"   @click="toast.warning('Patient has unpaid balance of EGP 450', 'Payment Due')">Warning Toast</AppButton>
            <AppButton variant="danger"    @click="toast.error('Failed to save patient record', 'Error')">Error Toast</AppButton>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             DIVIDERS
        ════════════════════════════════════════ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Dividers & Breadcrumbs</h2>
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <AppDivider />
            <AppDivider label="Patient History" />
            <AppBreadcrumb :items="[{ label: 'Dashboard', to: '/' }, { label: 'Patients', to: '/patients' }, { label: 'Ahmed Hassan' }]" />
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page layout ── */
.components-page { min-height: 100vh; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.components-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  align-items: start;
}

/* ── Section nav ── */
.section-nav { display: flex; flex-direction: column; }
.section-nav-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.375rem 0.625rem;
  border: none;
  background: transparent;
  color: #5D7187;
  font-size: 0.8rem;
  font-family: inherit;
  border-radius: 6px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.section-nav-btn:hover { color: #28B9FF; background: rgba(40,185,255,0.06); }

/* ── Sections ── */
.components-content { display: flex; flex-direction: column; gap: 3rem; }

.ds-section {}
.ds-section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #F4F8FC;
  margin-bottom: 1.25rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid rgba(100,190,255,0.12);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ds-subsection { margin-bottom: 1.25rem; }
.ds-sub-title { font-size: 0.8125rem; font-weight: 600; color: #8FA3B8; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }

/* ── Grids ── */
.color-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.75rem; }
.card-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.input-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.stat-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.flex-wrap-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: flex-start; }

/* ── Color swatches ── */
.color-swatch { display: flex; flex-direction: column; gap: 0.5rem; }
.swatch-block { height: 56px; border-radius: 10px; }
.swatch-info  { display: flex; flex-direction: column; gap: 0.1rem; }
.swatch-name  { font-size: 0.75rem; font-weight: 500; color: #F4F8FC; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .components-layout { grid-template-columns: 1fr; }
  .section-nav       { display: none; }
}
</style>
