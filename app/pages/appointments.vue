<script setup lang="ts">
import {
  appointments as allAppointments,
  appointmentTypes,
  appointmentStatuses,
  statusVariant,
  statusColor,
  typeColor,
  formatTime12,
  formatDateShort,
  durationOptions,
  reminderOptions,
} from '@/data/appointments'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  PaymentStatus,
} from '@/data/appointments'
import { patients } from '@/data/patients'

useHead({ title: 'Appointments — Dr. Dalia Clinic' })

const toast = useToast()

// ── Demo fixed date ────────────────────────────────────────────
const DEMO_DATE = '2026-10-02'

// ── Loading demo ───────────────────────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 900))

// ── In-memory dataset ──────────────────────────────────────────
const dataset = ref<Appointment[]>([...allAppointments])

// ── View mode ──────────────────────────────────────────────────
type ViewMode = 'day' | 'week' | 'month' | 'list'
const viewMode = ref<ViewMode>('week')

// ── Calendar navigation ────────────────────────────────────────
const currentDate = ref(DEMO_DATE) // YYYY-MM-DD

function parseDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00')
}
function fmtISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Get start of week (Saturday)
function getWeekStart(dateStr: string): string {
  const d = parseDate(dateStr)
  const day = d.getDay() // 0=Sun, 6=Sat
  const diff = (day + 1) % 7 // days from Saturday
  d.setDate(d.getDate() - diff)
  return fmtISO(d)
}

const weekStart = computed(() => getWeekStart(currentDate.value))
const weekDays  = computed(() => {
  const start = parseDate(weekStart.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return fmtISO(d)
  })
})

const monthStart = computed(() => {
  const d = parseDate(currentDate.value)
  return fmtISO(new Date(d.getFullYear(), d.getMonth(), 1))
})

const calendarTitle = computed(() => {
  const d = parseDate(currentDate.value)
  if (viewMode.value === 'day') {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
  if (viewMode.value === 'week') {
    const start = parseDate(weekStart.value)
    const end   = new Date(start); end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  if (viewMode.value === 'month') {
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return 'All Appointments'
})

function navigate(dir: -1 | 1) {
  const d = parseDate(currentDate.value)
  if (viewMode.value === 'day')   d.setDate(d.getDate() + dir)
  if (viewMode.value === 'week')  d.setDate(d.getDate() + dir * 7)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() + dir)
  if (viewMode.value === 'list')  d.setMonth(d.getMonth() + dir)
  currentDate.value = fmtISO(d)
}

function goToday() { currentDate.value = DEMO_DATE }

// ── Search & Filters ───────────────────────────────────────────
const search         = ref('')
const filterStatus   = ref<AppointmentStatus | ''>('')
const filterType     = ref<AppointmentType | ''>('')
const filterPayment  = ref<PaymentStatus | ''>('')

const hasFilters = computed(() => search.value || filterStatus.value || filterType.value || filterPayment.value)

function clearFilters() {
  search.value = ''
  filterStatus.value  = ''
  filterType.value    = ''
  filterPayment.value = ''
}

// ── Filtered dataset ───────────────────────────────────────────
const allFiltered = computed(() => {
  let r = dataset.value
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    r = r.filter(a =>
      a.patientName.toLowerCase().includes(q) ||
      a.patientId.toLowerCase().includes(q) ||
      a.patientPhone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
      a.reason.toLowerCase().includes(q)
    )
  }
  if (filterStatus.value)  r = r.filter(a => a.status === filterStatus.value)
  if (filterType.value)    r = r.filter(a => a.appointmentType === filterType.value)
  if (filterPayment.value) r = r.filter(a => a.paymentStatus === filterPayment.value)
  return r
})

// ── Appointments by date ───────────────────────────────────────
function apptsByDate(dateStr: string): Appointment[] {
  return allFiltered.value
    .filter(a => a.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

// ── Today's stats ──────────────────────────────────────────────
const todayAppts = computed(() => apptsByDate(DEMO_DATE))
const stats = computed(() => ({
  total:     todayAppts.value.length,
  confirmed: todayAppts.value.filter(a => a.status === 'Confirmed' || a.status === 'Checked In').length,
  waiting:   todayAppts.value.filter(a => a.status === 'Waiting' || a.status === 'Checked In').length,
  inProgress:todayAppts.value.filter(a => a.status === 'In Progress').length,
  completed: todayAppts.value.filter(a => a.status === 'Completed').length,
  noShow:    todayAppts.value.filter(a => a.status === 'No Show').length,
}))

// ── Waiting room ───────────────────────────────────────────────
const waitingRoom = computed(() =>
  todayAppts.value.filter(a => a.status === 'Checked In' || a.status === 'Waiting')
)

// ── Time slots for day/week view ───────────────────────────────
const timeSlots = computed(() => {
  const slots = []
  for (let h = 8; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 17) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

// Convert HH:MM to minutes from 08:00
function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h - 8) * 60 + m
}

function apptTop(a: Appointment): number {
  return (toMinutes(a.startTime) / 30) * 40
}
function apptHeight(a: Appointment): number {
  return Math.max((a.duration / 30) * 40, 40)
}

// ── Month calendar grid ────────────────────────────────────────
const monthGrid = computed(() => {
  const d     = parseDate(currentDate.value)
  const year  = d.getFullYear()
  const month = d.getMonth()
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)

  // Days of first week before month start (Saturday = first col)
  const startDay = (first.getDay() + 1) % 7 // 0=Sat
  const cells: (string | null)[] = Array(startDay).fill(null)
  for (let i = 1; i <= last.getDate(); i++) {
    cells.push(fmtISO(new Date(year, month, i)))
  }
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

const monthWeeks = computed(() => {
  const grid = monthGrid.value
  const weeks = []
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7))
  return weeks
})

// ── Appointment Details Drawer ─────────────────────────────────
const detailsOpen = ref(false)
const detailsAppt = ref<Appointment | null>(null)

function openDetails(a: Appointment) {
  detailsAppt.value = { ...a }
  detailsOpen.value = true
}

// ── Available actions per status ───────────────────────────────
function availableActions(status: AppointmentStatus): string[] {
  switch (status) {
    case 'Scheduled':   return ['confirm', 'checkin', 'reschedule', 'edit', 'cancel']
    case 'Confirmed':   return ['checkin', 'reschedule', 'edit', 'cancel']
    case 'Checked In':  return ['start', 'edit', 'cancel']
    case 'Waiting':     return ['start', 'edit', 'cancel', 'noshow']
    case 'In Progress': return ['complete', 'edit']
    case 'Completed':   return ['view']
    case 'Cancelled':   return ['reschedule']
    case 'No Show':     return ['reschedule']
    case 'Rescheduled': return ['confirm', 'checkin', 'edit', 'cancel']
    default:            return []
  }
}

// ── Status mutations ───────────────────────────────────────────
function mutateStatus(id: number, status: AppointmentStatus, extra?: Partial<Appointment>) {
  dataset.value = dataset.value.map(a =>
    a.id === id ? { ...a, status, ...extra } : a
  )
  if (detailsAppt.value?.id === id) {
    detailsAppt.value = { ...detailsAppt.value, status, ...extra }
  }
}

function handleAction(action: string, appt: Appointment) {
  switch (action) {
    case 'confirm':
      mutateStatus(appt.id, 'Confirmed')
      toast.success(`${appt.patientName}'s appointment confirmed`, 'Confirmed')
      break
    case 'checkin': {
      const now = new Date()
      const t   = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      mutateStatus(appt.id, 'Checked In', { checkedInAt: t })
      toast.success(`${appt.patientName} checked in at ${formatTime12(t)}`, 'Checked In')
      break
    }
    case 'start':
      mutateStatus(appt.id, 'In Progress')
      toast.info(`Visit started for ${appt.patientName}`, 'In Progress')
      break
    case 'complete':
      mutateStatus(appt.id, 'Completed')
      toast.success(`Visit completed for ${appt.patientName}`, 'Completed')
      detailsOpen.value = false
      break
    case 'noshow':
      confirmNoShowAppt.value = appt
      noShowOpen.value = true
      break
    case 'cancel':
      cancelTarget.value = appt
      cancelOpen.value   = true
      break
    case 'reschedule':
      openReschedule(appt)
      break
    case 'edit':
      openEdit(appt)
      break
    case 'view':
      toast.info(`Navigating to patient profile…`, 'Patient Profile')
      break
  }
}

// ── No Show Confirm ────────────────────────────────────────────
const noShowOpen      = ref(false)
const confirmNoShowAppt = ref<Appointment | null>(null)

function confirmNoShow() {
  if (!confirmNoShowAppt.value) return
  mutateStatus(confirmNoShowAppt.value.id, 'No Show')
  toast.warning(`${confirmNoShowAppt.value.patientName} marked as No Show`, 'No Show')
  noShowOpen.value = false
  detailsOpen.value = false
}

// ── Cancel Confirm ─────────────────────────────────────────────
const cancelOpen   = ref(false)
const cancelTarget = ref<Appointment | null>(null)
const cancelReason = ref('Patient request')

function confirmCancel() {
  if (!cancelTarget.value) return
  mutateStatus(cancelTarget.value.id, 'Cancelled', { notes: cancelTarget.value.notes + ` [Cancelled: ${cancelReason.value}]` })
  toast.error(`Appointment cancelled: ${cancelTarget.value.patientName}`, 'Cancelled')
  cancelOpen.value   = false
  detailsOpen.value  = false
  cancelTarget.value = null
}

// ── Reschedule Modal ───────────────────────────────────────────
const rescheduleOpen = ref(false)
const rescheduleTarget = ref<Appointment | null>(null)
const rescheduleForm   = ref({ date: '', startTime: '', reason: '' })
const rescheduleConflict = ref('')

function openReschedule(a: Appointment) {
  rescheduleTarget.value = a
  rescheduleForm.value   = { date: a.date, startTime: a.startTime, reason: '' }
  rescheduleConflict.value = ''
  rescheduleOpen.value   = true
  detailsOpen.value      = false
}

watch([() => rescheduleForm.value.date, () => rescheduleForm.value.startTime], () => {
  if (!rescheduleTarget.value || !rescheduleForm.value.date || !rescheduleForm.value.startTime) {
    rescheduleConflict.value = ''
    return
  }
  checkConflict(
    rescheduleForm.value.date,
    rescheduleForm.value.startTime,
    rescheduleTarget.value.duration,
    rescheduleTarget.value.id,
  )
})

function checkConflict(date: string, start: string, duration: number, excludeId?: number): boolean {
  const [sh, sm] = start.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = startMin + duration
  const conflict = dataset.value.find(a => {
    if (a.id === excludeId) return false
    if (a.date !== date) return false
    if (a.status === 'Cancelled' || a.status === 'No Show') return false
    const [ah, am] = a.startTime.split(':').map(Number)
    const aStart = ah * 60 + am
    const aEnd   = aStart + a.duration
    return startMin < aEnd && endMin > aStart
  })
  if (conflict) {
    rescheduleConflict.value = `Conflict: Dr. Dalia already has ${conflict.patientName}'s appointment from ${formatTime12(conflict.startTime)} to ${formatTime12(conflict.endTime)}.`
    return true
  }
  rescheduleConflict.value = ''
  return false
}

const rescheduleLoading = ref(false)
function confirmReschedule() {
  if (!rescheduleTarget.value) return
  if (rescheduleConflict.value) return
  rescheduleLoading.value = true
  setTimeout(() => {
    const t = rescheduleTarget.value!
    const d = rescheduleForm.value.duration ? parseInt(rescheduleForm.value.reason) : t.duration
    dataset.value = dataset.value.map(a => {
      if (a.id !== t.id) return a
      const newEnd = addMins(rescheduleForm.value.startTime, t.duration)
      return {
        ...a,
        date:      rescheduleForm.value.date,
        startTime: rescheduleForm.value.startTime,
        endTime:   newEnd,
        status:    'Rescheduled' as AppointmentStatus,
        notes:     a.notes + (rescheduleForm.value.reason ? ` [Rescheduled: ${rescheduleForm.value.reason}]` : ''),
      }
    })
    rescheduleLoading.value = false
    rescheduleOpen.value    = false
    toast.info(`Appointment rescheduled for ${t.patientName}`, 'Rescheduled')
  }, 700)
}

function addMins(t: string, m: number): string {
  const [h, mm] = t.split(':').map(Number)
  const total = h * 60 + mm + m
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ── Edit Modal ─────────────────────────────────────────────────
const editOpen    = ref(false)
const editForm    = ref<Partial<Appointment>>({})
const editConflict = ref('')

function openEdit(a: Appointment) {
  editForm.value    = { ...a }
  editConflict.value = ''
  editOpen.value    = true
  detailsOpen.value = false
}

watch([() => editForm.value.date, () => editForm.value.startTime], () => {
  if (!editForm.value.date || !editForm.value.startTime || !editForm.value.duration) {
    editConflict.value = ''
    return
  }
  const [sh, sm] = editForm.value.startTime.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = startMin + editForm.value.duration
  const conflict = dataset.value.find(a => {
    if (a.id === editForm.value.id) return false
    if (a.date !== editForm.value.date) return false
    if (a.status === 'Cancelled' || a.status === 'No Show') return false
    const [ah, am] = a.startTime.split(':').map(Number)
    const aStart = ah * 60 + am
    const aEnd   = aStart + a.duration
    return startMin < aEnd && endMin > aStart
  })
  editConflict.value = conflict
    ? `Conflict: ${conflict.patientName} is booked from ${formatTime12(conflict.startTime)} to ${formatTime12(conflict.endTime)}.`
    : ''
})

function saveEdit() {
  if (editConflict.value) return
  const f = editForm.value
  dataset.value = dataset.value.map(a => {
    if (a.id !== f.id) return a
    const endTime = addMins(f.startTime!, f.duration!)
    return { ...a, ...f, endTime }
  })
  if (detailsAppt.value?.id === f.id) {
    detailsAppt.value = { ...detailsAppt.value, ...f, endTime: addMins(f.startTime!, f.duration!) }
  }
  editOpen.value = false
  toast.success('Appointment updated successfully', 'Updated')
}

// ── Create Appointment Modal ───────────────────────────────────
const createOpen    = ref(false)
const createLoading = ref(false)
const createConflict = ref('')
const createForm    = ref({
  patientSearch: '',
  patientId: '',
  patientName: '',
  patientPhone: '',
  patientAge: 0,
  patientGender: 'Male' as 'Male' | 'Female',
  appointmentType: '' as AppointmentType | '',
  date: DEMO_DATE,
  startTime: '09:00',
  duration: 30,
  reason: '',
  notes: '',
  status: 'Scheduled' as AppointmentStatus,
  paymentStatus: 'Unpaid' as PaymentStatus,
  paymentAmount: 350,
  reminderEnabled: true,
  reminderTime: '1hr',
})

const patientSuggestions = computed(() => {
  const q = createForm.value.patientSearch.trim().toLowerCase()
  if (!q) return []
  return patients.filter(p =>
    p.fullName.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q)
  ).slice(0, 6)
})

const showPatientDropdown = ref(false)

function selectPatient(p: typeof patients[0]) {
  createForm.value.patientSearch = p.fullName
  createForm.value.patientId     = p.patientId
  createForm.value.patientName   = p.fullName
  createForm.value.patientPhone  = p.phone
  createForm.value.patientAge    = p.age
  createForm.value.patientGender = p.gender
  showPatientDropdown.value = false
}

watch([() => createForm.value.date, () => createForm.value.startTime, () => createForm.value.duration], () => {
  if (!createForm.value.date || !createForm.value.startTime) { createConflict.value = ''; return }
  const [sh, sm] = createForm.value.startTime.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = startMin + createForm.value.duration
  const conflict = dataset.value.find(a => {
    if (a.date !== createForm.value.date) return false
    if (a.status === 'Cancelled' || a.status === 'No Show') return false
    const [ah, am] = a.startTime.split(':').map(Number)
    const aStart = ah * 60 + am
    const aEnd   = aStart + a.duration
    return startMin < aEnd && endMin > aStart
  })
  createConflict.value = conflict
    ? `Conflict: Dr. Dalia already has ${conflict.patientName}'s appointment from ${formatTime12(conflict.startTime)} to ${formatTime12(conflict.endTime)}.`
    : ''
})

function openCreate(prefillDate?: string, prefillTime?: string) {
  createConflict.value   = ''
  showPatientDropdown.value = false
  createForm.value = {
    patientSearch: '', patientId: '', patientName: '', patientPhone: '',
    patientAge: 0, patientGender: 'Male',
    appointmentType: '', date: prefillDate || DEMO_DATE,
    startTime: prefillTime || '09:00', duration: 30,
    reason: '', notes: '', status: 'Scheduled', paymentStatus: 'Unpaid',
    paymentAmount: 350, reminderEnabled: true, reminderTime: '1hr',
  }
  createOpen.value = true
}

function submitCreate() {
  if (!createForm.value.patientName || !createForm.value.appointmentType || !createForm.value.date || !createForm.value.startTime) {
    toast.error('Please fill in all required fields', 'Validation')
    return
  }
  if (createConflict.value) { toast.error('Please resolve the scheduling conflict first', 'Conflict'); return }
  createLoading.value = true
  setTimeout(() => {
    const maxId = Math.max(...dataset.value.map(a => a.id))
    const f     = createForm.value
    const newA: Appointment = {
      id: maxId + 1,
      patientId:       f.patientId || `PT-TEMP${maxId + 1}`,
      patientName:     f.patientName,
      patientPhone:    f.patientPhone,
      patientAge:      f.patientAge,
      patientGender:   f.patientGender,
      appointmentType: f.appointmentType as AppointmentType,
      date:            f.date,
      startTime:       f.startTime,
      endTime:         addMins(f.startTime, f.duration),
      duration:        f.duration,
      status:          f.status,
      doctor:          'Dr. Dalia',
      location:        'Main Clinic – Room 1',
      reason:          f.reason,
      notes:           f.notes,
      paymentStatus:   f.paymentStatus,
      paymentAmount:   f.paymentAmount,
      reminderEnabled: f.reminderEnabled,
      reminderTime:    f.reminderTime,
      createdAt:       DEMO_DATE,
    }
    dataset.value = [newA, ...dataset.value]
    createLoading.value = false
    createOpen.value    = false
    toast.success(`Appointment created for ${f.patientName}`, 'Created')
  }, 700)
}

// ── List view pagination ───────────────────────────────────────
const listPage    = ref(1)
const listPerPage = ref(15)

const listFiltered = computed(() => {
  return [...allFiltered.value].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date)
    return cmp !== 0 ? cmp : a.startTime.localeCompare(b.startTime)
  })
})

const listTotal = computed(() => listFiltered.value.length)
const listRows  = computed(() => {
  const start = (listPage.value - 1) * listPerPage.value
  return listFiltered.value.slice(start, start + listPerPage.value)
})
const listPageStart = computed(() => Math.min((listPage.value - 1) * listPerPage.value + 1, listTotal.value))
const listPageEnd   = computed(() => Math.min(listPage.value * listPerPage.value, listTotal.value))

watch(allFiltered, () => { listPage.value = 1 })

// ── Columns for list view ──────────────────────────────────────
const listColumns = [
  { key: 'date',            label: 'Date',     sortable: true,  width: '110px' },
  { key: 'startTime',       label: 'Time',     sortable: true,  width: '90px' },
  { key: 'patientName',     label: 'Patient',  sortable: true,  width: '200px' },
  { key: 'appointmentType', label: 'Type',     sortable: true,  width: '150px' },
  { key: 'duration',        label: 'Duration', sortable: false, width: '80px',  align: 'center' as const },
  { key: 'status',          label: 'Status',   sortable: true,  width: '130px' },
  { key: 'paymentStatus',   label: 'Payment',  sortable: false, width: '100px' },
  { key: '_actions',        label: '',         width: '52px',   align: 'center' as const },
]

const paymentVariant: Record<string, string> = {
  'Paid':    'success',
  'Unpaid':  'warning',
  'Partial': 'info',
}

// ── Row action items for list view ─────────────────────────────
function getRowActions(appt: Appointment) {
  const items: any[] = []
  if (availableActions(appt.status).includes('confirm'))    items.push({ key: 'confirm',    label: 'Confirm',      icon: iconCheck })
  if (availableActions(appt.status).includes('checkin'))    items.push({ key: 'checkin',    label: 'Check In',     icon: iconUserCheck })
  if (availableActions(appt.status).includes('start'))      items.push({ key: 'start',      label: 'Start Visit',  icon: iconPlay })
  if (availableActions(appt.status).includes('complete'))   items.push({ key: 'complete',   label: 'Complete',     icon: iconDone })
  if (availableActions(appt.status).includes('reschedule')) items.push({ key: 'reschedule', label: 'Reschedule',   icon: iconCalendar })
  if (availableActions(appt.status).includes('edit'))       items.push({ key: 'edit',       label: 'Edit',         icon: iconEdit })
  if (availableActions(appt.status).includes('noshow'))     items.push({ key: 'sep', label: '', separator: true }, { key: 'noshow', label: 'No Show', icon: iconUserX, variant: 'danger' as const })
  if (availableActions(appt.status).includes('cancel'))     items.push({ key: 'sep2', label: '', separator: true }, { key: 'cancel', label: 'Cancel', icon: iconX, variant: 'danger' as const })
  items.push({ key: 'view', label: 'View Details', icon: iconEye })
  return items
}

// ── Day view click on empty slot ───────────────────────────────
function onSlotClick(date: string, time: string) {
  openCreate(date, time)
}

// ── Month view date click ──────────────────────────────────────
function onMonthDateClick(dateStr: string) {
  currentDate.value = dateStr
  viewMode.value    = 'day'
}

// ── Misc helpers ───────────────────────────────────────────────
function dayLabel(dateStr: string): string {
  const d = parseDate(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
}
function dayName(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}
function dayNum(dateStr: string): number {
  return parseDate(dateStr).getDate()
}
function isToday(dateStr: string): boolean {
  return dateStr === DEMO_DATE
}
function isCurrentMonth(dateStr: string): boolean {
  const d = parseDate(dateStr)
  const c = parseDate(currentDate.value)
  return d.getMonth() === c.getMonth() && d.getFullYear() === c.getFullYear()
}

function apptBg(status: AppointmentStatus): string {
  const c = statusColor[status]
  return `${c}18`
}
function apptBorder(status: AppointmentStatus): string {
  return statusColor[status]
}

// ── SVG Icons ─────────────────────────────────────────────────
const iconPlus      = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
const iconLeft      = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`
const iconRight     = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`
const iconCalendar  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
const iconEdit      = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
const iconEye       = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
const iconX         = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
const iconCheck     = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
const iconPlay      = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
const iconDone      = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
const iconUserCheck = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`
const iconUserX     = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>`
const iconBell      = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`
const iconDots      = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`
const iconList      = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
const iconGrid      = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
const iconSearch    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
const iconClock     = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
</script>

<template>
  <div class="appt-page">

    <!-- ── Page Header ──────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Appointments</h1>
        <p class="page-subtitle">Manage your clinic schedule and patient visits.</p>
      </div>
      <div class="header-right">
        <AppBadge variant="success" dot size="sm">Demo Environment</AppBadge>
        <AppButton variant="secondary" size="sm" @click="goToday">Today</AppButton>
        <AppButton variant="primary" size="sm" :icon-left="iconPlus" @click="openCreate()">
          New Appointment
        </AppButton>
      </div>
    </div>

    <!-- ── Stats Row ────────────────────────────────────────── -->
    <div class="stats-row">
      <div class="stat-item glass-card">
        <div class="stat-icon" style="background:rgba(40,185,255,0.10);color:#28B9FF">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-label">Today's Appointments</div>
          <div class="stat-val" style="color:#28B9FF">{{ isLoading ? '–' : stats.total }}</div>
        </div>
      </div>
      <div class="stat-item glass-card">
        <div class="stat-icon" style="background:rgba(40,185,255,0.10);color:#28B9FF">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-label">Confirmed</div>
          <div class="stat-val" style="color:#28B9FF">{{ isLoading ? '–' : stats.confirmed }}</div>
        </div>
      </div>
      <div class="stat-item glass-card">
        <div class="stat-icon" style="background:rgba(255,202,99,0.10);color:#FFCA63">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-label">Waiting</div>
          <div class="stat-val" style="color:#FFCA63">{{ isLoading ? '–' : stats.waiting }}</div>
        </div>
      </div>
      <div class="stat-item glass-card">
        <div class="stat-icon" style="background:rgba(53,211,154,0.10);color:#35D39A">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-label">Completed</div>
          <div class="stat-val" style="color:#35D39A">{{ isLoading ? '–' : stats.completed }}</div>
        </div>
      </div>
      <div class="stat-item glass-card">
        <div class="stat-icon" style="background:rgba(255,102,122,0.10);color:#FF667A">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-label">No Shows</div>
          <div class="stat-val" style="color:#FF667A">{{ isLoading ? '–' : stats.noShow }}</div>
        </div>
      </div>
    </div>

    <!-- ── Calendar Toolbar ──────────────────────────────────── -->
    <div class="cal-toolbar glass-card">
      <!-- Navigation -->
      <div class="cal-nav">
        <button class="cal-nav-btn focus-ring" aria-label="Previous" v-html="iconLeft" @click="navigate(-1)" />
        <AppButton variant="ghost" size="sm" @click="goToday">Today</AppButton>
        <button class="cal-nav-btn focus-ring" aria-label="Next" v-html="iconRight" @click="navigate(1)" />
      </div>

      <!-- Date label -->
      <div class="cal-title">{{ calendarTitle }}</div>

      <!-- View switcher -->
      <div class="view-tabs">
        <button
          v-for="v in ['day','week','month','list'] as ViewMode[]"
          :key="v"
          class="view-tab focus-ring"
          :class="viewMode === v ? 'view-tab-active' : ''"
          @click="viewMode = v"
        >
          {{ v.charAt(0).toUpperCase() + v.slice(1) }}
        </button>
      </div>
    </div>

    <!-- ── Search + Filter Toolbar ───────────────────────────── -->
    <div class="filter-toolbar glass">
      <!-- Search -->
      <div class="ft-search">
        <span class="ft-search-icon" v-html="iconSearch" />
        <input
          v-model="search"
          class="ft-search-input focus-ring"
          placeholder="Search patient or appointment…"
          aria-label="Search appointments"
        />
        <button v-if="search" class="ft-clear-btn focus-ring" @click="search = ''" v-html="iconX" aria-label="Clear search" />
      </div>
      <!-- Filters -->
      <div class="ft-filters">
        <select v-model="filterStatus" class="ft-select focus-ring" aria-label="Filter by status">
          <option value="">All Status</option>
          <option v-for="s in appointmentStatuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterType" class="ft-select focus-ring" aria-label="Filter by type">
          <option value="">All Types</option>
          <option v-for="t in appointmentTypes" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filterPayment" class="ft-select focus-ring" aria-label="Filter by payment">
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
        </select>
        <button v-if="hasFilters" class="ft-clear focus-ring" @click="clearFilters">
          <span v-html="iconX" />Clear
        </button>
      </div>
    </div>

    <!-- ── Main Layout ───────────────────────────────────────── -->
    <div class="main-layout">

      <!-- ╔══════════════════════════════════════════════════╗ -->
      <!-- ║              CALENDAR / LIST AREA               ║ -->
      <!-- ╚══════════════════════════════════════════════════╝ -->
      <div class="calendar-area glass-card">

        <!-- ── LOADING STATE ─────────────────────────────── -->
        <template v-if="isLoading">
          <div class="skeleton-cal">
            <div v-for="i in 8" :key="i" class="skeleton-row">
              <div class="skeleton" style="width:40px;height:14px;flex-shrink:0" />
              <div class="skeleton" style="flex:1;height:40px;border-radius:8px" />
            </div>
          </div>
        </template>

        <!-- ── DAY VIEW ──────────────────────────────────── -->
        <template v-else-if="viewMode === 'day'">
          <div class="cal-day-header">
            <div class="cal-day-title">
              <span :class="isToday(currentDate) ? 'day-today-dot' : ''">
                {{ parseDate(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
              </span>
              <AppBadge v-if="isToday(currentDate)" variant="primary" size="sm">Today</AppBadge>
            </div>
            <span class="day-count-badge">{{ apptsByDate(currentDate).length }} appointments</span>
          </div>

          <div class="day-grid">
            <!-- Time axis -->
            <div class="day-time-col">
              <div v-for="slot in timeSlots" :key="slot" class="day-time-label">
                {{ formatTime12(slot) }}
              </div>
            </div>

            <!-- Events column -->
            <div class="day-events-col" @click.self>
              <!-- Slot backgrounds -->
              <div
                v-for="slot in timeSlots"
                :key="slot"
                class="day-slot-bg"
                @click="onSlotClick(currentDate, slot)"
              />
              <!-- Current time indicator -->
              <div v-if="isToday(currentDate)" class="day-current-time" :style="{ top: `${(toMinutes('11:00') / 30) * 40}px` }">
                <span class="cti-dot" />
                <span class="cti-line" />
              </div>
              <!-- Appointments -->
              <div
                v-for="a in apptsByDate(currentDate)"
                :key="a.id"
                class="day-event"
                :style="{
                  top: `${apptTop(a)}px`,
                  height: `${apptHeight(a)}px`,
                  background: apptBg(a.status),
                  borderLeftColor: apptBorder(a.status),
                }"
                @click.stop="openDetails(a)"
              >
                <div class="de-time">{{ formatTime12(a.startTime) }}</div>
                <div class="de-name">{{ a.patientName }}</div>
                <div class="de-type">{{ a.appointmentType }}</div>
                <AppBadge :variant="statusVariant[a.status]" size="sm" dot>{{ a.status }}</AppBadge>
                <span v-if="a.reminderEnabled" class="de-bell" v-html="iconBell" />
              </div>
              <!-- Empty state -->
              <AppEmptyState
                v-if="apptsByDate(currentDate).length === 0"
                title="No appointments"
                description="No appointments for this date. Click a slot to schedule one."
                action-label="New Appointment"
                @action="openCreate(currentDate)"
              />
            </div>
          </div>
        </template>

        <!-- ── WEEK VIEW ─────────────────────────────────── -->
        <template v-else-if="viewMode === 'week'">
          <div class="week-header-row">
            <div class="week-time-spacer" />
            <div
              v-for="day in weekDays"
              :key="day"
              class="week-day-header"
              :class="isToday(day) ? 'week-day-today' : ''"
              @click="currentDate = day; viewMode = 'day'"
            >
              <span class="wdh-name">{{ dayName(day) }}</span>
              <span class="wdh-num" :class="isToday(day) ? 'wdh-today' : ''">{{ dayNum(day) }}</span>
              <span class="wdh-count">{{ apptsByDate(day).length }}</span>
            </div>
          </div>

          <div class="week-grid">
            <!-- Time axis -->
            <div class="week-time-col">
              <div v-for="slot in timeSlots" :key="slot" class="week-time-label">
                {{ formatTime12(slot) }}
              </div>
            </div>
            <!-- Day columns -->
            <div v-for="day in weekDays" :key="day" class="week-day-col">
              <!-- Slot backgrounds -->
              <div
                v-for="slot in timeSlots"
                :key="slot"
                class="week-slot-bg"
                @click="onSlotClick(day, slot)"
              />
              <!-- Current time -->
              <div v-if="isToday(day)" class="day-current-time" :style="{ top: `${(toMinutes('11:00') / 30) * 40}px` }">
                <span class="cti-dot" /><span class="cti-line" />
              </div>
              <!-- Events -->
              <div
                v-for="a in apptsByDate(day)"
                :key="a.id"
                class="week-event"
                :style="{
                  top: `${apptTop(a)}px`,
                  height: `${apptHeight(a)}px`,
                  background: apptBg(a.status),
                  borderLeftColor: apptBorder(a.status),
                }"
                @click.stop="openDetails(a)"
              >
                <div class="we-time">{{ formatTime12(a.startTime) }}</div>
                <div class="we-name">{{ a.patientName.split(' ')[0] }}</div>
                <div class="we-type">{{ a.appointmentType }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── MONTH VIEW ────────────────────────────────── -->
        <template v-else-if="viewMode === 'month'">
          <div class="month-header">
            <div v-for="wd in ['Sat','Sun','Mon','Tue','Wed','Thu','Fri']" :key="wd" class="month-weekday">{{ wd }}</div>
          </div>
          <div class="month-body">
            <div v-for="(week, wi) in monthWeeks" :key="wi" class="month-week">
              <div
                v-for="(day, di) in week"
                :key="di"
                class="month-cell"
                :class="[
                  day && isToday(day)             ? 'month-cell-today' : '',
                  day && !isCurrentMonth(day)     ? 'month-cell-other' : '',
                  day === currentDate             ? 'month-cell-selected' : '',
                  !day                            ? 'month-cell-empty'  : '',
                ]"
                @click="day && onMonthDateClick(day)"
              >
                <template v-if="day">
                  <span class="month-day-num">{{ dayNum(day) }}</span>
                  <div class="month-event-dots">
                    <span
                      v-for="a in apptsByDate(day).slice(0, 4)"
                      :key="a.id"
                      class="month-dot"
                      :style="{ background: statusColor[a.status] }"
                    />
                  </div>
                  <div v-if="apptsByDate(day).length > 0" class="month-count">
                    {{ apptsByDate(day).length }} appt{{ apptsByDate(day).length > 1 ? 's' : '' }}
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- ── LIST VIEW ─────────────────────────────────── -->
        <template v-else-if="viewMode === 'list'">
          <div class="list-header">
            <span class="list-title">All Appointments</span>
            <span class="list-count">{{ listTotal.toLocaleString() }} records</span>
            <div class="list-header-right">
              <select v-model="listPerPage" class="per-page-sel focus-ring">
                <option :value="10">10 / page</option>
                <option :value="15">15 / page</option>
                <option :value="25">25 / page</option>
                <option :value="50">50 / page</option>
              </select>
            </div>
          </div>

          <AppDataTable
            :columns="listColumns"
            :rows="listRows"
            :loading="isLoading"
            key-field="id"
            empty-title="No appointments found"
            empty-description="Try adjusting your search or filters."
            @row-click="row => openDetails(row as Appointment)"
          >
            <template #cell-date="{ row }">
              <span :class="row.date === DEMO_DATE ? 'today-date' : 'list-date'">
                {{ formatDateShort(row.date) }}
              </span>
            </template>
            <template #cell-startTime="{ row }">
              <span class="list-time">{{ formatTime12(row.startTime) }}</span>
            </template>
            <template #cell-patientName="{ row }">
              <div class="list-patient">
                <AppAvatar :name="row.patientName" size="xs" shape="rounded" />
                <div class="list-patient-info">
                  <span class="list-patient-name">{{ row.patientName }}</span>
                  <span class="list-patient-id">{{ row.patientId }}</span>
                </div>
              </div>
            </template>
            <template #cell-appointmentType="{ row }">
              <span class="list-type" :style="{ color: typeColor[row.appointmentType as AppointmentType] }">{{ row.appointmentType }}</span>
            </template>
            <template #cell-duration="{ row }">
              <span class="list-duration">{{ row.duration }}m</span>
            </template>
            <template #cell-status="{ row }">
              <AppBadge :variant="statusVariant[row.status as AppointmentStatus]" dot size="sm">{{ row.status }}</AppBadge>
            </template>
            <template #cell-paymentStatus="{ row }">
              <AppBadge :variant="paymentVariant[row.paymentStatus]" size="sm">{{ row.paymentStatus }}</AppBadge>
            </template>
            <template #cell-_actions="{ row }">
              <div @click.stop>
                <AppDropdown :items="getRowActions(row as Appointment)" align="right" @select="key => { if(!['sep','sep2'].includes(key)) handleAction(key, row as Appointment) }">
                  <template #trigger>
                    <button class="row-action-btn focus-ring" v-html="iconDots" aria-label="Actions" />
                  </template>
                </AppDropdown>
              </div>
            </template>
          </AppDataTable>

          <!-- Pagination -->
          <div class="list-footer">
            <span class="list-pagi-info">
              Showing <strong>{{ listPageStart }}–{{ listPageEnd }}</strong> of <strong>{{ listTotal }}</strong>
            </span>
            <AppPagination v-model="listPage" :total="listTotal" :per-page="listPerPage" />
          </div>
        </template>

      </div>

      <!-- ╔══════════════════════════════════════════════════╗ -->
      <!-- ║              SIDE PANEL                         ║ -->
      <!-- ╚══════════════════════════════════════════════════╝ -->
      <div class="side-panel">

        <!-- Today's Schedule mini-list -->
        <div class="side-card glass-card">
          <div class="side-card-header">
            <span class="side-card-title">Today's Schedule</span>
            <span class="side-card-date">Oct 2, 2026</span>
          </div>

          <!-- Progress -->
          <div class="schedule-progress">
            <div class="sp-labels">
              <span class="sp-label">{{ stats.completed }} of {{ stats.total }} completed</span>
              <span class="sp-pct">{{ stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0 }}%</span>
            </div>
            <AppProgress :value="stats.completed" :max="stats.total" variant="success" size="xs" />
          </div>

          <!-- Appointment list -->
          <div class="today-list">
            <div
              v-for="a in todayAppts.slice(0, 8)"
              :key="a.id"
              class="today-item"
              :class="`today-item-${a.status.toLowerCase().replace(' ', '-')}`"
              @click="openDetails(a)"
            >
              <div class="ti-time">{{ formatTime12(a.startTime) }}</div>
              <div class="ti-info">
                <div class="ti-name">{{ a.patientName.split(' ')[0] }} {{ a.patientName.split(' ')[1]?.charAt(0) }}.</div>
                <div class="ti-type">{{ a.appointmentType }}</div>
              </div>
              <AppBadge :variant="statusVariant[a.status]" size="sm">{{ a.status }}</AppBadge>
            </div>
            <div v-if="todayAppts.length === 0" class="today-empty">No appointments today</div>
          </div>
        </div>

        <!-- Waiting Room -->
        <div class="side-card glass-card" v-if="waitingRoom.length > 0">
          <div class="side-card-header">
            <span class="side-card-title">Waiting Room</span>
            <AppBadge variant="warning" size="sm">{{ waitingRoom.length }}</AppBadge>
          </div>
          <div class="waiting-list">
            <div v-for="(a, idx) in waitingRoom" :key="a.id" class="waiting-item">
              <span class="wi-num">{{ idx + 1 }}</span>
              <AppAvatar :name="a.patientName" size="xs" shape="rounded" />
              <div class="wi-info">
                <div class="wi-name">{{ a.patientName }}</div>
                <div class="wi-time">Checked in {{ a.checkedInAt ? formatTime12(a.checkedInAt) : 'N/A' }}</div>
              </div>
              <button class="wi-start focus-ring" title="Start Visit" @click="handleAction('start', a)" v-html="iconPlay" />
            </div>
          </div>
        </div>

        <!-- Availability card -->
        <div class="side-card glass-card">
          <div class="side-card-header">
            <span class="side-card-title">Today's Availability</span>
          </div>
          <div class="avail-body">
            <div class="avail-row">
              <div class="avail-block avail-booked">
                <div class="avail-num">{{ stats.total }}</div>
                <div class="avail-lbl">Booked</div>
              </div>
              <div class="avail-block avail-free">
                <div class="avail-num">{{ Math.max(0, 18 - stats.total) }}</div>
                <div class="avail-lbl">Available</div>
              </div>
            </div>
            <AppProgress :value="stats.total" :max="18" variant="primary" size="sm" label="Today" show-label />
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="side-card glass-card">
          <div class="side-card-title" style="padding:0 0 0.75rem">Quick Actions</div>
          <div class="quick-actions">
            <AppButton variant="secondary" size="sm" block :icon-left="iconPlus" @click="openCreate()">New Appointment</AppButton>
            <AppButton variant="ghost" size="sm" block :icon-left="iconCalendar" @click="viewMode = 'list'">View All</AppButton>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!--   APPOINTMENT DETAILS DRAWER                          -->
    <!-- ══════════════════════════════════════════════════════ -->
    <AppDrawer v-model="detailsOpen" title="Appointment Details" side="right" size="md">
      <template v-if="detailsAppt">
        <div class="detail-content">
          <!-- Patient hero -->
          <div class="detail-hero">
            <AppAvatar :name="detailsAppt.patientName" size="lg" shape="rounded" />
            <div class="detail-hero-info">
              <h2 class="detail-name">{{ detailsAppt.patientName }}</h2>
              <span class="detail-pid">{{ detailsAppt.patientId }}</span>
              <div class="detail-demos">
                <span class="detail-demo-item">{{ detailsAppt.patientAge }}y</span>
                <span class="detail-demo-sep">·</span>
                <span class="detail-demo-item">{{ detailsAppt.patientGender }}</span>
                <span class="detail-demo-sep">·</span>
                <span class="detail-demo-item">{{ detailsAppt.patientPhone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-divider" />

          <!-- Status + type -->
          <div class="detail-badges">
            <AppBadge :variant="statusVariant[detailsAppt.status]" dot>{{ detailsAppt.status }}</AppBadge>
            <span class="detail-type-badge" :style="{ color: typeColor[detailsAppt.appointmentType], background: `${typeColor[detailsAppt.appointmentType]}14`, border: `1px solid ${typeColor[detailsAppt.appointmentType]}30` }">
              {{ detailsAppt.appointmentType }}
            </span>
            <AppBadge :variant="paymentVariant[detailsAppt.paymentStatus]">{{ detailsAppt.paymentStatus }}</AppBadge>
          </div>

          <!-- Info grid -->
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-label">Date</span>
              <span class="detail-value">{{ formatDateShort(detailsAppt.date) }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Time</span>
              <span class="detail-value">{{ formatTime12(detailsAppt.startTime) }} – {{ formatTime12(detailsAppt.endTime) }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Duration</span>
              <span class="detail-value">{{ detailsAppt.duration }} min</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Doctor</span>
              <span class="detail-value">{{ detailsAppt.doctor }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Location</span>
              <span class="detail-value">{{ detailsAppt.location }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Payment</span>
              <span class="detail-value">EGP {{ detailsAppt.paymentAmount.toLocaleString() }}</span>
            </div>
          </div>

          <div class="detail-divider" />

          <div class="detail-field-full">
            <span class="detail-label">Reason</span>
            <p class="detail-reason">{{ detailsAppt.reason || '—' }}</p>
          </div>

          <template v-if="detailsAppt.notes">
            <div class="detail-field-full">
              <span class="detail-label">Clinical Notes</span>
              <p class="detail-notes">{{ detailsAppt.notes }}</p>
            </div>
          </template>

          <template v-if="detailsAppt.checkedInAt">
            <div class="detail-checkin">
              <span class="detail-label" v-html="iconUserCheck" />
              <span style="color:#35D39A; font-size:0.8125rem">Checked in at {{ formatTime12(detailsAppt.checkedInAt) }}</span>
            </div>
          </template>

          <template v-if="detailsAppt.reminderEnabled">
            <div class="detail-reminder">
              <span v-html="iconBell" style="color:#FFCA63" />
              <span style="font-size:0.8125rem;color:#8FA3B8">Reminder: {{ reminderOptions.find(r => r.value === detailsAppt!.reminderTime)?.label || detailsAppt.reminderTime }}</span>
            </div>
          </template>
        </div>
      </template>

      <template #footer v-if="detailsAppt">
        <div class="detail-footer-actions">
          <AppButton v-if="availableActions(detailsAppt.status).includes('confirm')"    variant="outline"  size="sm" @click="handleAction('confirm',    detailsAppt)">Confirm</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('checkin')"    variant="primary"  size="sm" @click="handleAction('checkin',    detailsAppt)">Check In</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('start')"      variant="success"  size="sm" @click="handleAction('start',      detailsAppt)">Start Visit</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('complete')"   variant="success"  size="sm" @click="handleAction('complete',   detailsAppt)">Complete</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('reschedule')" variant="secondary" size="sm" @click="handleAction('reschedule', detailsAppt)">Reschedule</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('edit')"       variant="secondary" size="sm" @click="handleAction('edit',       detailsAppt)">Edit</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('noshow')"     variant="warning"  size="sm" @click="handleAction('noshow',     detailsAppt)">No Show</AppButton>
          <AppButton v-if="availableActions(detailsAppt.status).includes('cancel')"     variant="danger"   size="sm" @click="handleAction('cancel',      detailsAppt)">Cancel</AppButton>
        </div>
      </template>
    </AppDrawer>

    <!-- ══════════════════════════════════════════════════════ -->
    <!--   CREATE APPOINTMENT MODAL                            -->
    <!-- ══════════════════════════════════════════════════════ -->
    <AppModal v-model="createOpen" title="New Appointment" size="lg">
      <div class="appt-form">
        <!-- Patient search -->
        <div class="form-field">
          <label class="form-label">Patient <span class="req">*</span></label>
          <div class="patient-search-wrap">
            <span class="ps-icon" v-html="iconSearch" />
            <input
              v-model="createForm.patientSearch"
              class="ps-input focus-ring"
              placeholder="Search patient by name or ID…"
              @focus="showPatientDropdown = true"
              @blur="() => window.setTimeout(() => showPatientDropdown = false, 200)"
              aria-label="Search patient"
            />
            <Transition name="dropdown">
              <div v-if="showPatientDropdown && patientSuggestions.length > 0" class="ps-dropdown">
                <button
                  v-for="p in patientSuggestions"
                  :key="p.id"
                  class="ps-item"
                  @mousedown.prevent="selectPatient(p)"
                >
                  <AppAvatar :name="p.fullName" size="xs" shape="rounded" />
                  <div class="ps-item-info">
                    <span class="ps-item-name">{{ p.fullName }}</span>
                    <span class="ps-item-id">{{ p.patientId }} · {{ p.phone }}</span>
                  </div>
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-field">
            <label class="form-label">Appointment Type <span class="req">*</span></label>
            <select v-model="createForm.appointmentType" class="form-select focus-ring">
              <option value="">Select type…</option>
              <option v-for="t in appointmentTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Status</label>
            <select v-model="createForm.status" class="form-select focus-ring">
              <option v-for="s in ['Scheduled','Confirmed']" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="form-row-3">
          <div class="form-field">
            <label class="form-label">Date <span class="req">*</span></label>
            <AppInput v-model="createForm.date" type="text" placeholder="YYYY-MM-DD" id="create-date" />
          </div>
          <div class="form-field">
            <label class="form-label">Start Time <span class="req">*</span></label>
            <AppInput v-model="createForm.startTime" type="text" placeholder="HH:MM" id="create-time" />
          </div>
          <div class="form-field">
            <label class="form-label">Duration</label>
            <select v-model="createForm.duration" class="form-select focus-ring">
              <option v-for="d in durationOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>
        </div>

        <!-- Conflict alert -->
        <Transition name="alert-fade">
          <AppAlert v-if="createConflict" variant="warning" title="Scheduling Conflict">
            {{ createConflict }} Please choose a different time slot.
          </AppAlert>
        </Transition>

        <AppInput v-model="createForm.reason" label="Reason / Chief Complaint" placeholder="e.g. Hypertension follow-up" id="create-reason" />

        <div class="form-row-2">
          <div class="form-field">
            <label class="form-label">Payment Status</label>
            <select v-model="createForm.paymentStatus" class="form-select focus-ring">
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Reminder</label>
            <select v-model="createForm.reminderTime" class="form-select focus-ring">
              <option v-for="r in reminderOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
          </div>
        </div>

        <AppTextarea v-model="createForm.notes" label="Notes" placeholder="Additional notes…" :rows="2" id="create-notes" />
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="createOpen = false">Cancel</AppButton>
        <AppButton variant="primary" :loading="createLoading" @click="submitCreate">Create Appointment</AppButton>
      </template>
    </AppModal>

    <!-- ══════════════════════════════════════════════════════ -->
    <!--   EDIT APPOINTMENT MODAL                              -->
    <!-- ══════════════════════════════════════════════════════ -->
    <AppModal v-model="editOpen" title="Edit Appointment" size="lg">
      <div class="appt-form" v-if="editForm.id">
        <div class="form-row-2">
          <AppInput v-model="editForm.date" label="Date" placeholder="YYYY-MM-DD" id="edit-date" />
          <AppInput v-model="editForm.startTime" label="Start Time" placeholder="HH:MM" id="edit-time" />
        </div>
        <Transition name="alert-fade">
          <AppAlert v-if="editConflict" variant="warning" title="Scheduling Conflict">{{ editConflict }}</AppAlert>
        </Transition>
        <div class="form-row-2">
          <div class="form-field">
            <label class="form-label">Duration</label>
            <select v-model="editForm.duration" class="form-select focus-ring">
              <option v-for="d in durationOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Status</label>
            <select v-model="editForm.status" class="form-select focus-ring">
              <option v-for="s in appointmentStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label class="form-label">Type</label>
            <select v-model="editForm.appointmentType" class="form-select focus-ring">
              <option v-for="t in appointmentTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Payment</label>
            <select v-model="editForm.paymentStatus" class="form-select focus-ring">
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        </div>
        <AppInput v-model="editForm.reason" label="Reason" id="edit-reason" />
        <AppTextarea v-model="editForm.notes" label="Notes" :rows="2" id="edit-notes" />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="editOpen = false">Cancel</AppButton>
        <AppButton variant="primary" :disabled="!!editConflict" @click="saveEdit">Save Changes</AppButton>
      </template>
    </AppModal>

    <!-- ══════════════════════════════════════════════════════ -->
    <!--   RESCHEDULE MODAL                                    -->
    <!-- ══════════════════════════════════════════════════════ -->
    <AppModal v-model="rescheduleOpen" title="Reschedule Appointment" size="md">
      <div class="appt-form" v-if="rescheduleTarget">
        <div class="reschedule-patient">
          <AppAvatar :name="rescheduleTarget.patientName" size="sm" shape="rounded" />
          <div>
            <div class="rs-name">{{ rescheduleTarget.patientName }}</div>
            <div class="rs-info">{{ rescheduleTarget.appointmentType }} · {{ formatTime12(rescheduleTarget.startTime) }}</div>
          </div>
        </div>
        <div class="form-row-2">
          <AppInput v-model="rescheduleForm.date" label="New Date" placeholder="YYYY-MM-DD" id="rs-date" />
          <AppInput v-model="rescheduleForm.startTime" label="New Start Time" placeholder="HH:MM" id="rs-time" />
        </div>
        <Transition name="alert-fade">
          <AppAlert v-if="rescheduleConflict" variant="warning" title="Scheduling Conflict">{{ rescheduleConflict }}</AppAlert>
        </Transition>
        <AppInput v-model="rescheduleForm.reason" label="Reason for Rescheduling" placeholder="e.g. Patient request" id="rs-reason" />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="rescheduleOpen = false">Cancel</AppButton>
        <AppButton variant="primary" :loading="rescheduleLoading" :disabled="!!rescheduleConflict" @click="confirmReschedule">Reschedule</AppButton>
      </template>
    </AppModal>

    <!-- ══════════════════════════════════════════════════════ -->
    <!--   CANCEL CONFIRM DIALOG                               -->
    <!-- ══════════════════════════════════════════════════════ -->
    <AppModal v-model="cancelOpen" title="Cancel Appointment" size="sm">
      <div class="cancel-body">
        <div class="cancel-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF667A" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="cancel-title">Cancel Appointment?</h3>
        <p class="cancel-msg" v-if="cancelTarget">
          Are you sure you want to cancel <strong>{{ cancelTarget.patientName }}'s</strong> appointment on
          {{ formatDateShort(cancelTarget.date) }} at {{ formatTime12(cancelTarget.startTime) }}?
        </p>
        <div class="form-field" style="width:100%;text-align:left">
          <label class="form-label">Reason for Cancellation</label>
          <select v-model="cancelReason" class="form-select focus-ring">
            <option>Patient request</option>
            <option>Doctor unavailable</option>
            <option>Emergency</option>
            <option>Rescheduled</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="cancelOpen = false">Keep Appointment</AppButton>
        <AppButton variant="danger" @click="confirmCancel">Cancel Appointment</AppButton>
      </template>
    </AppModal>

    <!-- ══════════════════════════════════════════════════════ -->
    <!--   NO SHOW CONFIRM DIALOG                              -->
    <!-- ══════════════════════════════════════════════════════ -->
    <AppConfirmDialog
      v-model="noShowOpen"
      title="Mark as No Show?"
      :message="`Mark ${confirmNoShowAppt?.patientName}'s appointment as No Show? This cannot be undone easily.`"
      confirm-label="Mark No Show"
      variant="warning"
      @confirm="confirmNoShow"
      @cancel="noShowOpen = false"
    />

  </div>
</template>

<style scoped>
/* ── Page ── */
.appt-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: fade-in 220ms ease both;
}

/* ── Header ── */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.header-left { display: flex; flex-direction: column; gap: 0.25rem; }
.page-title  { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.025em; color: #F4F8FC; margin: 0; }
.page-subtitle { font-size: 0.875rem; color: #5D7187; margin: 0; }
.header-right { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }

/* ── Stats row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}
@media (max-width: 1200px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px)  { .stats-row { grid-template-columns: repeat(2, 1fr); } }

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
}
.stat-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-body { display: flex; flex-direction: column; gap: 0.15rem; }
.stat-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #5D7187; }
.stat-val   { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }

/* ── Calendar toolbar ── */
.cal-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  flex-wrap: wrap;
}
.cal-nav { display: flex; align-items: center; gap: 0.25rem; }
.cal-nav-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  border: 1px solid rgba(100,190,255,0.14);
  border-radius: 8px;
  background: rgba(9,24,39,0.80);
  color: #8FA3B8;
  cursor: pointer;
  transition: all 150ms ease;
  outline: none;
}
.cal-nav-btn:hover { border-color: rgba(100,190,255,0.30); color: #F4F8FC; }
.cal-title {
  flex: 1;
  text-align: center;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #F4F8FC;
  white-space: nowrap;
}
.view-tabs { display: flex; background: rgba(9,24,39,0.80); border: 1px solid rgba(100,190,255,0.14); border-radius: 10px; padding: 2px; gap: 2px; }
.view-tab {
  height: 28px; padding: 0 0.875rem;
  background: transparent; border: none;
  font-size: 0.8125rem; font-family: inherit; font-weight: 500;
  color: #5D7187; border-radius: 8px;
  cursor: pointer; transition: all 150ms ease; outline: none; white-space: nowrap;
}
.view-tab:hover { color: #8FA3B8; background: rgba(100,190,255,0.06); }
.view-tab-active { background: rgba(40,185,255,0.12) !important; color: #28B9FF !important; }

/* ── Filter toolbar ── */
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  border: 1px solid rgba(100,190,255,0.14);
  flex-wrap: wrap;
}
.ft-search { position: relative; flex: 1; min-width: 200px; max-width: 340px; }
.ft-search-icon {
  position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%);
  color: #5D7187; pointer-events: none; display: flex;
}
.ft-search-input {
  width: 100%; height: 2.125rem; padding: 0 2rem 0 2rem;
  background: rgba(9,24,39,0.80); border: 1px solid rgba(100,190,255,0.14);
  border-radius: 9px; color: #F4F8FC; font-size: 0.8125rem; font-family: inherit; outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.ft-search-input::placeholder { color: #5D7187; }
.ft-search-input:focus { border-color: #28B9FF; box-shadow: 0 0 0 2px rgba(40,185,255,0.14); }
.ft-clear-btn {
  position: absolute; right: 0.4rem; top: 50%; transform: translateY(-50%);
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; color: #5D7187; cursor: pointer; border-radius: 4px;
  transition: color 150ms ease;
}
.ft-clear-btn:hover { color: #F4F8FC; }
.ft-filters { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; flex: 1; }
.ft-select {
  height: 2.125rem; padding: 0 1.75rem 0 0.65rem;
  background: rgba(9,24,39,0.80)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235D7187' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 0.5rem center;
  border: 1px solid rgba(100,190,255,0.14); border-radius: 9px;
  color: #8FA3B8; font-size: 0.8rem; font-family: inherit; appearance: none; cursor: pointer; outline: none;
  transition: border-color 150ms ease;
}
.ft-select:focus { border-color: #28B9FF; color: #F4F8FC; }
.ft-select option { background: #081321; }
.ft-clear {
  display: inline-flex; align-items: center; gap: 0.3rem;
  height: 2.125rem; padding: 0 0.65rem;
  background: rgba(255,102,122,0.08); border: 1px solid rgba(255,102,122,0.25);
  border-radius: 9px; color: #FF667A; font-size: 0.8rem; font-family: inherit;
  cursor: pointer; transition: all 150ms ease; outline: none;
}
.ft-clear:hover { background: rgba(255,102,122,0.15); }

/* ── Main layout ── */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.25rem;
  align-items: start;
}
@media (max-width: 1100px) { .main-layout { grid-template-columns: 1fr; } }

/* ── Calendar area card ── */
.calendar-area { overflow: hidden; min-height: 500px; }

/* ── Skeleton ── */
.skeleton-cal { display: flex; flex-direction: column; gap: 0; padding: 1rem; }
.skeleton-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(100,190,255,0.06); }

/* ── DAY VIEW ── */
.cal-day-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(100,190,255,0.10);
}
.cal-day-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; font-weight: 600; color: #F4F8FC; }
.day-today-dot::before { content:''; display:inline-block; width:7px; height:7px; border-radius:9999px; background:#28B9FF; margin-right:0.4rem; box-shadow:0 0 6px rgba(40,185,255,0.60); }
.day-count-badge { font-size: 0.75rem; color: #5D7187; background: rgba(100,190,255,0.06); border: 1px solid rgba(100,190,255,0.12); padding: 0.15rem 0.6rem; border-radius: 9999px; }

.day-grid {
  display: flex;
  overflow-y: auto;
  max-height: calc(100vh - 380px);
  min-height: 400px;
}
.day-time-col { flex-shrink: 0; width: 68px; }
.day-time-label {
  height: 40px;
  display: flex; align-items: flex-start; justify-content: flex-end;
  padding: 4px 8px 0 0;
  font-size: 0.7rem; color: #5D7187; white-space: nowrap;
  border-right: 1px solid rgba(100,190,255,0.08);
}
.day-events-col {
  flex: 1;
  position: relative;
  min-height: 0;
}
.day-slot-bg {
  height: 40px;
  border-bottom: 1px solid rgba(100,190,255,0.05);
  cursor: pointer;
  transition: background 100ms ease;
}
.day-slot-bg:hover { background: rgba(40,185,255,0.03); }

/* ── WEEK VIEW ── */
.week-header-row {
  display: grid;
  border-bottom: 1px solid rgba(100,190,255,0.10);
  position: sticky; top: 0; z-index: 10;
  background: rgba(8,19,33,0.95);
  backdrop-filter: blur(16px);
}
.week-header-row { grid-template-columns: 68px repeat(7, 1fr); }
.week-time-spacer { height: 56px; border-right: 1px solid rgba(100,190,255,0.08); }
.week-day-header {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 56px; gap: 0.15rem;
  border-left: 1px solid rgba(100,190,255,0.06);
  cursor: pointer; transition: background 150ms ease;
  padding: 0 4px;
}
.week-day-header:hover { background: rgba(40,185,255,0.04); }
.week-day-today { background: rgba(40,185,255,0.06) !important; }
.wdh-name  { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #5D7187; }
.wdh-num   { font-size: 1.1rem; font-weight: 700; color: #8FA3B8; }
.wdh-today { color: #28B9FF; background: rgba(40,185,255,0.14); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 9999px; box-shadow: 0 0 12px rgba(40,185,255,0.25); }
.wdh-count { font-size: 0.65rem; color: #5D7187; }

.week-grid {
  display: grid;
  grid-template-columns: 68px repeat(7, 1fr);
  overflow-y: auto;
  max-height: calc(100vh - 440px);
  min-height: 380px;
}
.week-time-col { flex-shrink: 0; }
.week-time-label {
  height: 40px;
  display: flex; align-items: flex-start; justify-content: flex-end;
  padding: 4px 8px 0 0;
  font-size: 0.65rem; color: #5D7187; white-space: nowrap;
  border-right: 1px solid rgba(100,190,255,0.08);
  border-bottom: 1px solid rgba(100,190,255,0.04);
}
.week-day-col {
  position: relative;
  border-left: 1px solid rgba(100,190,255,0.06);
  min-height: 0;
}
.week-slot-bg {
  height: 40px;
  border-bottom: 1px solid rgba(100,190,255,0.04);
  cursor: pointer;
  transition: background 100ms ease;
}
.week-slot-bg:hover { background: rgba(40,185,255,0.03); }

/* ── Current time indicator ── */
.day-current-time {
  position: absolute; left: 0; right: 0; z-index: 5;
  display: flex; align-items: center; pointer-events: none;
}
.cti-dot {
  width: 8px; height: 8px; border-radius: 9999px;
  background: #FF667A; box-shadow: 0 0 6px rgba(255,102,122,0.60); flex-shrink: 0;
}
.cti-line { flex: 1; height: 1px; background: #FF667A; opacity: 0.5; }

/* ── Day event ── */
.day-event {
  position: absolute;
  left: 4px; right: 4px;
  border-radius: 10px;
  border-left: 3px solid;
  padding: 5px 8px;
  cursor: pointer;
  transition: box-shadow 150ms ease, transform 150ms ease;
  overflow: hidden;
  z-index: 2;
}
.day-event:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  transform: translateX(1px);
}
.de-time { font-size: 0.65rem; color: #8FA3B8; margin-bottom: 2px; }
.de-name { font-size: 0.8125rem; font-weight: 600; color: #F4F8FC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.de-type { font-size: 0.7rem; color: #8FA3B8; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.de-bell { position: absolute; top: 5px; right: 6px; color: #FFCA63; display: flex; }

/* ── Week event ── */
.week-event {
  position: absolute;
  left: 2px; right: 2px;
  border-radius: 8px;
  border-left: 2px solid;
  padding: 3px 5px;
  cursor: pointer;
  transition: box-shadow 150ms ease;
  overflow: hidden;
  z-index: 2;
}
.week-event:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.20); }
.we-time { font-size: 0.6rem; color: #8FA3B8; }
.we-name { font-size: 0.7rem; font-weight: 600; color: #F4F8FC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.we-type { font-size: 0.6rem; color: #8FA3B8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Month view ── */
.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid rgba(100,190,255,0.10);
}
.month-weekday {
  text-align: center; padding: 0.5rem 0;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; color: #5D7187;
}
.month-body { display: flex; flex-direction: column; }
.month-week { display: grid; grid-template-columns: repeat(7, 1fr); }
.month-cell {
  min-height: 88px; padding: 8px;
  border: 1px solid rgba(100,190,255,0.06);
  cursor: pointer;
  transition: background 150ms ease;
  position: relative;
}
.month-cell:hover { background: rgba(40,185,255,0.04); }
.month-cell-today { background: rgba(40,185,255,0.06) !important; border-color: rgba(40,185,255,0.20) !important; }
.month-cell-selected { background: rgba(40,185,255,0.10) !important; border-color: rgba(40,185,255,0.35) !important; }
.month-cell-other { opacity: 0.35; }
.month-cell-empty { cursor: default; }
.month-cell-empty:hover { background: transparent !important; }
.month-day-num { font-size: 0.8125rem; font-weight: 600; color: #8FA3B8; display: block; margin-bottom: 4px; }
.month-cell-today .month-day-num {
  color: #28B9FF;
  background: rgba(40,185,255,0.14);
  width: 24px; height: 24px; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; box-shadow: 0 0 8px rgba(40,185,255,0.25);
}
.month-event-dots { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 3px; }
.month-dot { width: 6px; height: 6px; border-radius: 9999px; flex-shrink: 0; }
.month-count { font-size: 0.65rem; color: #5D7187; }

/* ── List view header/footer ── */
.list-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgba(100,190,255,0.10);
  flex-wrap: wrap;
}
.list-title { font-size: 0.9375rem; font-weight: 600; color: #F4F8FC; }
.list-count { font-size: 0.75rem; color: #5D7187; background: rgba(100,190,255,0.06); border: 1px solid rgba(100,190,255,0.12); padding: 0.15rem 0.6rem; border-radius: 9999px; }
.list-header-right { margin-left: auto; }
.list-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1.25rem; border-top: 1px solid rgba(100,190,255,0.08);
  flex-wrap: wrap; gap: 0.75rem;
}
.list-pagi-info { font-size: 0.8125rem; color: #5D7187; }
.list-pagi-info strong { color: #8FA3B8; }

.per-page-sel {
  height: 2rem; padding: 0 1.5rem 0 0.5rem;
  background: rgba(9,24,39,0.80)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235D7187' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 0.4rem center;
  border: 1px solid rgba(100,190,255,0.14); border-radius: 8px;
  color: #8FA3B8; font-size: 0.8rem; font-family: inherit; appearance: none; cursor: pointer; outline: none;
}
.per-page-sel option { background: #081321; }

/* ── List cell styles ── */
.today-date { color: #28B9FF; font-weight: 600; font-size: 0.8125rem; }
.list-date  { color: #8FA3B8; font-size: 0.8125rem; }
.list-time  { color: #F4F8FC; font-size: 0.8125rem; font-weight: 500; }
.list-patient { display: flex; align-items: center; gap: 0.5rem; }
.list-patient-info { display: flex; flex-direction: column; gap: 0.1rem; }
.list-patient-name { font-size: 0.8125rem; font-weight: 500; color: #F4F8FC; }
.list-patient-id   { font-size: 0.7rem; color: #5D7187; font-family: monospace; }
.list-type     { font-size: 0.8125rem; font-weight: 500; }
.list-duration { font-size: 0.8125rem; color: #8FA3B8; }
.row-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none;
  background: transparent; color: #5D7187; border-radius: 7px; cursor: pointer;
  transition: all 150ms ease;
}
.row-action-btn:hover { background: rgba(100,190,255,0.10); color: #F4F8FC; }

/* ── Side panel ── */
.side-panel { display: flex; flex-direction: column; gap: 1rem; }
.side-card  { padding: 1rem; }
.side-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.875rem; }
.side-card-title  { font-size: 0.875rem; font-weight: 600; color: #F4F8FC; }
.side-card-date   { font-size: 0.75rem; color: #5D7187; }

.schedule-progress { margin-bottom: 0.875rem; }
.sp-labels { display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
.sp-label  { font-size: 0.75rem; color: #5D7187; }
.sp-pct    { font-size: 0.75rem; color: #35D39A; font-weight: 600; }

.today-list { display: flex; flex-direction: column; gap: 0.25rem; }
.today-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.625rem; border-radius: 9px;
  cursor: pointer; transition: background 150ms ease;
  border: 1px solid transparent;
}
.today-item:hover { background: rgba(40,185,255,0.06); border-color: rgba(100,190,255,0.12); }
.today-item-in-progress { background: rgba(40,185,255,0.06); border-color: rgba(40,185,255,0.20); }
.today-item-waiting { background: rgba(255,202,99,0.05); }
.ti-time { font-size: 0.7rem; color: #5D7187; white-space: nowrap; min-width: 52px; }
.ti-info { flex: 1; min-width: 0; }
.ti-name { font-size: 0.8125rem; font-weight: 500; color: #F4F8FC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ti-type { font-size: 0.7rem; color: #5D7187; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.today-empty { font-size: 0.8125rem; color: #5D7187; text-align: center; padding: 1rem 0; }

.waiting-list { display: flex; flex-direction: column; gap: 0.5rem; }
.waiting-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem; border-radius: 9px;
  background: rgba(255,202,99,0.05); border: 1px solid rgba(255,202,99,0.12);
}
.wi-num  { width: 18px; height: 18px; border-radius: 9999px; background: rgba(255,202,99,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #FFCA63; flex-shrink: 0; }
.wi-info { flex: 1; min-width: 0; }
.wi-name { font-size: 0.8rem; font-weight: 500; color: #F4F8FC; }
.wi-time { font-size: 0.7rem; color: #5D7187; }
.wi-start {
  width: 24px; height: 24px; border-radius: 6px;
  border: none; background: rgba(40,185,255,0.10); color: #28B9FF;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 150ms ease; flex-shrink: 0;
}
.wi-start:hover { background: rgba(40,185,255,0.20); }

.avail-body { display: flex; flex-direction: column; gap: 0.875rem; }
.avail-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.avail-block { text-align: center; border-radius: 10px; padding: 0.625rem; }
.avail-booked { background: rgba(40,185,255,0.08); border: 1px solid rgba(40,185,255,0.15); }
.avail-free   { background: rgba(53,211,154,0.08); border: 1px solid rgba(53,211,154,0.15); }
.avail-num  { font-size: 1.5rem; font-weight: 700; color: #F4F8FC; }
.avail-lbl  { font-size: 0.7rem; color: #5D7187; font-weight: 500; }
.quick-actions { display: flex; flex-direction: column; gap: 0.5rem; }

/* ── Detail drawer content ── */
.detail-content { display: flex; flex-direction: column; gap: 1rem; }
.detail-hero { display: flex; align-items: center; gap: 1rem; }
.detail-hero-info { flex: 1; min-width: 0; }
.detail-name { font-size: 1.125rem; font-weight: 600; color: #F4F8FC; margin: 0 0 0.25rem; }
.detail-pid  { font-size: 0.75rem; color: #5D7187; font-family: monospace; display: block; margin-bottom: 0.35rem; }
.detail-demos { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; }
.detail-demo-item { font-size: 0.8rem; color: #8FA3B8; }
.detail-demo-sep  { color: #5D7187; }
.detail-divider { height: 1px; background: rgba(100,190,255,0.10); }
.detail-badges { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.detail-type-badge { font-size: 0.75rem; font-weight: 500; border-radius: 9999px; padding: 0.15rem 0.625rem; flex-shrink: 0; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.25rem; }
.detail-field { display: flex; flex-direction: column; gap: 0.2rem; }
.detail-field-full { display: flex; flex-direction: column; gap: 0.35rem; }
.detail-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #5D7187; }
.detail-value { font-size: 0.875rem; color: #F4F8FC; }
.detail-reason { font-size: 0.875rem; color: #8FA3B8; margin: 0; }
.detail-notes  { font-size: 0.8125rem; color: #8FA3B8; line-height: 1.5; margin: 0; background: rgba(100,190,255,0.04); border: 1px solid rgba(100,190,255,0.08); border-radius: 8px; padding: 0.625rem; }
.detail-checkin { display: flex; align-items: center; gap: 0.5rem; }
.detail-reminder { display: flex; align-items: center; gap: 0.4rem; }
.detail-footer-actions { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }

/* ── Appointment form ── */
.appt-form { display: flex; flex-direction: column; gap: 0.875rem; }
.form-field { display: flex; flex-direction: column; gap: 0.3rem; }
.form-label { font-size: 0.8rem; font-weight: 500; color: #8FA3B8; }
.req { color: #FF667A; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.875rem; }
@media (max-width: 520px) { .form-row-2, .form-row-3 { grid-template-columns: 1fr; } }
.form-select {
  height: 2.375rem; padding: 0 2rem 0 0.875rem;
  background: rgba(9,24,39,0.72)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235D7187' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 0.6rem center;
  border: 1px solid rgba(100,190,255,0.14); border-radius: 10px;
  color: #F4F8FC; font-size: 0.875rem; font-family: inherit; appearance: none; cursor: pointer; outline: none;
  backdrop-filter: blur(12px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.form-select:focus { border-color: #28B9FF; box-shadow: 0 0 0 2px rgba(40,185,255,0.18); }
.form-select option { background: #081321; }

/* Patient search ── */
.patient-search-wrap { position: relative; }
.ps-icon {
  position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
  color: #5D7187; pointer-events: none; display: flex;
}
.ps-input {
  width: 100%; height: 2.375rem; padding: 0 0.875rem 0 2.375rem;
  background: rgba(9,24,39,0.72); border: 1px solid rgba(100,190,255,0.14);
  border-radius: 10px; color: #F4F8FC; font-size: 0.875rem; font-family: inherit; outline: none;
  backdrop-filter: blur(12px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.ps-input::placeholder { color: #5D7187; }
.ps-input:focus { border-color: #28B9FF; box-shadow: 0 0 0 2px rgba(40,185,255,0.18); }
.ps-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 400;
  background: rgba(9,24,39,0.98); backdrop-filter: blur(20px);
  border: 1px solid rgba(100,190,255,0.18); border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.45);
  padding: 0.375rem; max-height: 240px; overflow-y: auto;
}
.ps-item {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.5rem 0.625rem; border-radius: 8px;
  border: none; background: transparent; width: 100%; cursor: pointer;
  text-align: left; transition: background 150ms ease;
}
.ps-item:hover { background: rgba(100,190,255,0.08); }
.ps-item-info { display: flex; flex-direction: column; gap: 0.1rem; }
.ps-item-name { font-size: 0.875rem; font-weight: 500; color: #F4F8FC; }
.ps-item-id   { font-size: 0.75rem; color: #5D7187; }

/* Reschedule ── */
.reschedule-patient { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(100,190,255,0.04); border: 1px solid rgba(100,190,255,0.10); border-radius: 12px; margin-bottom: 0.25rem; }
.rs-name { font-size: 0.9375rem; font-weight: 600; color: #F4F8FC; }
.rs-info { font-size: 0.8rem; color: #5D7187; }

/* Cancel ── */
.cancel-body { display: flex; flex-direction: column; align-items: center; gap: 0.875rem; text-align: center; padding: 0.5rem 0; }
.cancel-icon { width: 56px; height: 56px; border-radius: 9999px; background: rgba(255,102,122,0.10); display: flex; align-items: center; justify-content: center; }
.cancel-title { font-size: 1rem; font-weight: 600; color: #F4F8FC; }
.cancel-msg   { font-size: 0.875rem; color: #8FA3B8; line-height: 1.5; }

/* Dropdown animation */
.dropdown-enter-active { animation: dd-in 160ms ease both; }
.dropdown-leave-active { animation: dd-out 130ms ease both; }
@keyframes dd-in  { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dd-out { from { opacity: 1; } to { opacity: 0; transform: translateY(-4px); } }
.alert-fade-enter-active { transition: opacity 200ms ease; }
.alert-fade-leave-active { transition: opacity 150ms ease; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .filter-toolbar { flex-direction: column; align-items: stretch; }
  .ft-search { max-width: 100%; }
  .week-grid, .week-header-row { grid-template-columns: 48px repeat(7, 1fr); }
  .week-time-label { font-size: 0.58rem; padding: 2px 4px 0 0; }
  .we-name { font-size: 0.6rem; }
  .we-type { display: none; }
}
@media (max-width: 480px) {
  .page-header { flex-direction: column; }
  .cal-toolbar { flex-direction: column; }
  .cal-title { order: -1; }
  .stats-row { grid-template-columns: 1fr 1fr; }
}
</style>
