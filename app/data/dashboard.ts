// ============================================================
// DR. DALIA CLINIC — Dashboard Mock Data
// Demo-only: no backend, no API calls.
// ============================================================

// ── Stat Cards ───────────────────────────────────────────────
export const dashboardStats = [
  {
    key: 'total-patients',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
    title: 'Total Patients',
    value: '1,284',
    change: 8.4,
    changeLabel: 'vs last month',
    description: '',
    variant: 'primary' as const,
  },
  {
    key: 'todays-appointments',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    title: "Today's Appointments",
    value: '18',
    change: 0,
    changeLabel: '',
    description: '6 remaining',
    variant: 'info' as const,
  },
  {
    key: 'todays-visits',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><polyline points="9 13 11 15 15 11"/></svg>`,
    title: "Today's Visits",
    value: '14',
    change: 0,
    changeLabel: '',
    description: '78% completed',
    variant: 'success' as const,
  },
  {
    key: 'monthly-revenue',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    title: 'Monthly Revenue',
    value: 'EGP 186,450',
    change: 12.6,
    changeLabel: 'vs last month',
    description: '',
    variant: 'warning' as const,
  },
]

// ── Appointment Analytics (Last 7 Days) ──────────────────────
export const appointmentData = [
  { day: 'Sat', appointments: 12 },
  { day: 'Sun', appointments: 18 },
  { day: 'Mon', appointments: 15 },
  { day: 'Tue', appointments: 22 },
  { day: 'Wed', appointments: 19 },
  { day: 'Thu', appointments: 24 },
  { day: 'Fri', appointments: 16 },
]

// ── Today's Schedule ─────────────────────────────────────────
export const todayAppointments = [
  {
    id: 1,
    time: '09:00',
    patient: 'Ahmed Hassan',
    type: 'Follow-up',
    status: 'confirmed' as const,
  },
  {
    id: 2,
    time: '10:00',
    patient: 'Sara Mohamed',
    type: 'New Patient',
    status: 'waiting' as const,
  },
  {
    id: 3,
    time: '11:30',
    patient: 'Mohamed Ali',
    type: 'Follow-up',
    status: 'confirmed' as const,
  },
  {
    id: 4,
    time: '12:30',
    patient: 'Mariam Ahmed',
    type: 'Consultation',
    status: 'completed' as const,
  },
  {
    id: 5,
    time: '13:30',
    patient: 'Omar Khaled',
    type: 'Follow-up',
    status: 'pending' as const,
  },
]

// ── Patient Overview (Donut Chart Data) ──────────────────────
export const patientOverview = [
  { name: 'Active',    value: 824, color: '#28B9FF' },
  { name: 'Follow-up', value: 286, color: '#4DB8FF' },
  { name: 'New',       value: 124, color: '#35D39A' },
  { name: 'Archived',  value: 50,  color: '#5D7187' },
]

// ── Recent Patients (Table) ───────────────────────────────────
export const recentPatients = [
  { id: 1, name: 'Ahmed Hassan',  age: 42, lastVisit: 'Today',  status: 'active'   as const },
  { id: 2, name: 'Sara Mohamed',  age: 35, lastVisit: 'Today',  status: 'followup' as const },
  { id: 3, name: 'Omar Khaled',   age: 51, lastVisit: 'Sep 29', status: 'active'   as const },
  { id: 4, name: 'Mariam Ali',    age: 29, lastVisit: 'Sep 28', status: 'new'      as const },
  { id: 5, name: 'Youssef Ahmed', age: 47, lastVisit: 'Sep 27', status: 'followup' as const },
]

// ── Recent Activity (Timeline) ───────────────────────────────
export const recentActivity = [
  {
    id: 1,
    time: '10:42 AM',
    title: 'New visit completed',
    description: 'Ahmed Hassan',
    variant: 'success' as const,
    icon: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  },
  {
    id: 2,
    time: '10:15 AM',
    title: 'Prescription created',
    description: 'Sara Mohamed',
    variant: 'primary' as const,
    icon: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7 21H3v-4z"/></svg>`,
  },
  {
    id: 3,
    time: '09:48 AM',
    title: 'Lab result uploaded',
    description: 'Omar Khaled',
    variant: 'neutral' as const,
    icon: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3h6v11l4 6H5l4-6z"/></svg>`,
  },
  {
    id: 4,
    time: '09:20 AM',
    title: 'New patient registered',
    description: 'Mariam Ali',
    variant: 'warning' as const,
    icon: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
]

// ── Follow-up Reminders ──────────────────────────────────────
export const followUpReminders = [
  { id: 1, patient: 'Ahmed Hassan', due: 'Follow-up due today',  urgency: 'danger'  as const },
  { id: 2, patient: 'Sara Mohamed', due: 'Follow-up tomorrow',   urgency: 'warning' as const },
  { id: 3, patient: 'Omar Khaled',  due: 'Follow-up in 3 days',  urgency: 'primary' as const },
]
