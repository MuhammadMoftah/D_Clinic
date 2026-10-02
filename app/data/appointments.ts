// ────────────────────────────────────────────────────────────────
//  MOCK DATA — appointments.ts
//  Dr. Dalia Clinic — Frontend Demo
//  Demo Date: October 2, 2026
// ────────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked In'
  | 'Waiting'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Rescheduled'

export type AppointmentType =
  | 'New Patient'
  | 'Follow-up'
  | 'Consultation'
  | 'Routine Visit'
  | 'Urgent Visit'
  | 'Procedure'
  | 'Lab Review'
  | 'Teleconsultation'

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial'

export interface Appointment {
  id: number
  patientId: string
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: 'Male' | 'Female'
  appointmentType: AppointmentType
  date: string          // YYYY-MM-DD
  startTime: string     // HH:MM (24h)
  endTime: string       // HH:MM (24h)
  duration: number      // minutes
  status: AppointmentStatus
  doctor: string
  location: string
  reason: string
  notes: string
  paymentStatus: PaymentStatus
  paymentAmount: number  // EGP
  reminderEnabled: boolean
  reminderTime: string   // '30min' | '1hr' | '2hr' | '1day' | ''
  checkedInAt?: string   // HH:MM when checked in
  createdAt: string
}

// ── Appointment Types ───────────────────────────────────────────
export const appointmentTypes: AppointmentType[] = [
  'New Patient',
  'Follow-up',
  'Consultation',
  'Routine Visit',
  'Urgent Visit',
  'Procedure',
  'Lab Review',
  'Teleconsultation',
]

// ── Appointment Statuses ────────────────────────────────────────
export const appointmentStatuses: AppointmentStatus[] = [
  'Scheduled',
  'Confirmed',
  'Checked In',
  'Waiting',
  'In Progress',
  'Completed',
  'Cancelled',
  'No Show',
  'Rescheduled',
]

// ── Clinic Working Hours ────────────────────────────────────────
export const clinicWorkingHours = {
  Saturday:  { open: '09:00', close: '17:00', isOpen: true },
  Sunday:    { open: '09:00', close: '17:00', isOpen: true },
  Monday:    { open: '09:00', close: '17:00', isOpen: true },
  Tuesday:   { open: '09:00', close: '17:00', isOpen: true },
  Wednesday: { open: '09:00', close: '17:00', isOpen: true },
  Thursday:  { open: '09:00', close: '17:00', isOpen: true },
  Friday:    { open: '09:00', close: '17:00', isOpen: false },
}

// ── Duration options ────────────────────────────────────────────
export const durationOptions = [
  { value: 15,  label: '15 min' },
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '60 min' },
  { value: 90,  label: '90 min' },
]

// ── Reminder options ────────────────────────────────────────────
export const reminderOptions = [
  { value: '',      label: 'No reminder' },
  { value: '30min', label: '30 minutes before' },
  { value: '1hr',   label: '1 hour before' },
  { value: '2hr',   label: '2 hours before' },
  { value: '1day',  label: '1 day before' },
]

// ── Helper: add minutes to HH:MM ───────────────────────────────
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function appt(
  id: number,
  patientId: string,
  patientName: string,
  phone: string,
  age: number,
  gender: 'Male' | 'Female',
  type: AppointmentType,
  date: string,
  start: string,
  duration: number,
  status: AppointmentStatus,
  reason: string,
  payment: PaymentStatus,
  amount: number,
  reminder: boolean,
  reminderTime: string,
  notes = '',
  checkedInAt?: string,
): Appointment {
  return {
    id,
    patientId,
    patientName,
    patientPhone: phone,
    patientAge: age,
    patientGender: gender,
    appointmentType: type,
    date,
    startTime: start,
    endTime: addMinutes(start, duration),
    duration,
    status,
    doctor: 'Dr. Dalia',
    location: 'Main Clinic – Room 1',
    reason,
    notes,
    paymentStatus: payment,
    paymentAmount: amount,
    reminderEnabled: reminder,
    reminderTime,
    checkedInAt,
    createdAt: '2026-09-28',
  }
}

// ── Demo Appointment Dataset (70 appointments) ──────────────────
export const appointments: Appointment[] = [
  // ── October 2, 2026 (TODAY) ─────────────────────────────────
  appt(1,  'PT-001284', 'Ahmed Hassan',       '+20 100 123 4567', 42, 'Male',   'Follow-up',       '2026-10-02', '09:00', 30, 'Completed',  'Hypertension follow-up',         'Paid',    350, true,  '1hr',   'BP stabilized. Continue medication.', '09:05'),
  appt(2,  'PT-001283', 'Fatma Mohamed',      '+20 101 987 6543', 35, 'Female', 'Consultation',    '2026-10-02', '09:30', 30, 'Completed',  'Thyroid management',             'Paid',    500, true,  '30min', 'TSH levels reviewed.', '09:35'),
  appt(3,  'PT-001282', 'Omar El-Sayed',      '+20 115 456 7890', 51, 'Male',   'Routine Visit',   '2026-10-02', '10:00', 30, 'Completed',  'Diabetes quarterly check',       'Paid',    350, true,  '1hr',   'HbA1c within acceptable range.', '10:03'),
  appt(4,  'PT-001281', 'Nour Ibrahim',       '+20 106 321 0987', 28, 'Female', 'New Patient',     '2026-10-02', '10:30', 45, 'Completed',  'General health assessment',      'Paid',    600, true,  '1day',  'Initial evaluation done.', '10:28'),
  appt(5,  'PT-001280', 'Khaled Abdel-Aziz',  '+20 112 654 3210', 63, 'Male',   'Follow-up',       '2026-10-02', '11:15', 30, 'In Progress','Cardiac follow-up',              'Paid',    400, true,  '1hr',   ''),
  appt(6,  'PT-001278', 'Tariq El-Masry',     '+20 103 111 2233', 38, 'Male',   'Follow-up',       '2026-10-02', '11:45', 30, 'Waiting',    'Post-surgery check',             'Unpaid',  350, true,  '30min', '', '11:40'),
  appt(7,  'PT-001277', 'Heba Mostafa',       '+20 109 444 5566', 31, 'Female', 'Consultation',    '2026-10-02', '12:30', 30, 'Checked In', 'Respiratory issue review',       'Partial', 400, true,  '1hr',   '', '12:25'),
  appt(8,  'PT-001276', 'Mahmoud Samir',      '+20 122 888 9900', 57, 'Male',   'Lab Review',      '2026-10-02', '13:00', 30, 'Confirmed',  'Blood work analysis',            'Unpaid',  300, false, '',      ''),
  appt(9,  'PT-001275', 'Aya Kamal',          '+20 100 234 5678', 26, 'Female', 'New Patient',     '2026-10-02', '13:30', 45, 'Confirmed',  'First visit – hormonal check',   'Unpaid',  600, true,  '30min', ''),
  appt(10, 'PT-001274', 'Sherif Naguib',      '+20 111 345 6789', 49, 'Male',   'Routine Visit',   '2026-10-02', '14:15', 30, 'Scheduled',  'Annual check-up',                'Unpaid',  350, true,  '2hr',   ''),
  appt(11, 'PT-001273', 'Mona El-Fattah',     '+20 106 567 8901', 40, 'Female', 'Follow-up',       '2026-10-02', '14:45', 30, 'Confirmed',  'Thyroid post-medication review', 'Paid',    350, true,  '1hr',   ''),
  appt(12, 'PT-001272', 'Hassan El-Sherbini', '+20 115 678 9012', 70, 'Male',   'Follow-up',       '2026-10-02', '15:15', 45, 'Confirmed',  'Elderly hypertension + arthritis','Paid',   450, true,  '1day',  ''),
  appt(13, 'PT-001271', 'Dina Hamdi',         '+20 128 901 2345', 33, 'Female', 'Consultation',    '2026-10-02', '16:00', 30, 'Scheduled',  'Nutritional consultation',       'Unpaid',  500, false, '',      ''),
  appt(14, 'PT-001270', 'Amr Salah',          '+20 103 012 3456', 22, 'Male',   'New Patient',     '2026-10-02', '16:30', 30, 'Scheduled',  'Sports injury assessment',       'Unpaid',  600, true,  '30min', ''),
  appt(15, 'PT-001279', 'Rania Yousef',       '+20 128 777 8899', 44, 'Female', 'Follow-up',       '2026-10-02', '08:30', 30, 'No Show',    'General follow-up',              'Unpaid',  350, true,  '1hr',   ''),

  // ── October 1, 2026 (YESTERDAY) ─────────────────────────────
  appt(16, 'PT-001268', 'Youssef El-Gamal',  '+20 122 234 5671', 45, 'Male',   'Follow-up',       '2026-10-01', '09:00', 30, 'Completed',  'Chest pain evaluation',          'Paid',    400, true,  '1hr',   'ECG normal.'),
  appt(17, 'PT-001267', 'Noha Badawi',        '+20 100 345 6782', 39, 'Female', 'Consultation',    '2026-10-01', '09:30', 30, 'Completed',  'Respiratory infection',          'Paid',    500, true,  '30min', ''),
  appt(18, 'PT-001266', 'Walid Mansour',      '+20 111 456 7893', 60, 'Male',   'Routine Visit',   '2026-10-01', '10:00', 45, 'Completed',  'Annual cardiovascular check',    'Paid',    600, true,  '2hr',   ''),
  appt(19, 'PT-001265', 'Iman Tawfik',        '+20 106 678 9014', 47, 'Female', 'Follow-up',       '2026-10-01', '10:45', 30, 'Completed',  'Lipid panel review',             'Paid',    350, false, '',      ''),
  appt(20, 'PT-001264', 'Bassem Rizk',        '+20 115 789 0125', 36, 'Male',   'New Patient',     '2026-10-01', '11:30', 45, 'Completed',  'First visit – back pain',        'Paid',    600, true,  '1hr',   ''),
  appt(21, 'PT-001263', 'Ghada El-Rashid',    '+20 128 012 3456', 52, 'Female', 'Follow-up',       '2026-10-01', '12:15', 30, 'Cancelled',  'Post-menopausal follow-up',      'Unpaid',  350, true,  '1day',  'Patient cancelled.'),
  appt(22, 'PT-001262', 'Adel Gaber',         '+20 103 123 4567', 66, 'Male',   'Routine Visit',   '2026-10-01', '13:00', 30, 'Completed',  'Geriatric routine check',        'Paid',    350, true,  '1hr',   ''),
  appt(23, 'PT-001261', 'Layla El-Sherif',    '+20 109 234 5678', 30, 'Female', 'Consultation',    '2026-10-01', '13:30', 30, 'Completed',  'Hormonal consultation',          'Paid',    500, false, '',      ''),
  appt(24, 'PT-001260', 'Ibrahim El-Husseiny','+20 122 345 6789', 58, 'Male',   'Follow-up',       '2026-10-01', '14:00', 30, 'Completed',  'Prostate follow-up',             'Paid',    400, true,  '30min', ''),

  // ── September 30, 2026 ───────────────────────────────────────
  appt(25, 'PT-001259', 'Mariam Khalil',      '+20 100 456 7890', 23, 'Female', 'New Patient',     '2026-09-30', '09:00', 45, 'Completed',  'First consultation',             'Paid',    600, true,  '1hr',   ''),
  appt(26, 'PT-001258', 'Sameh Barakat',      '+20 111 567 8901', 41, 'Male',   'Follow-up',       '2026-09-30', '10:00', 30, 'Completed',  'Hypertension management',        'Paid',    350, false, '',      ''),
  appt(27, 'PT-001257', 'Hana Zaki',          '+20 106 789 0123', 37, 'Female', 'Teleconsultation','2026-09-30', '11:00', 30, 'Completed',  'Remote consultation',            'Paid',    400, true,  '30min', ''),
  appt(28, 'PT-001256', 'Mostafa Shawky',     '+20 115 890 1234', 54, 'Male',   'Follow-up',       '2026-09-30', '11:30', 30, 'No Show',    'Blood pressure check',           'Unpaid',  350, true,  '1hr',   ''),
  appt(29, 'PT-001255', 'Nadia El-Gendy',     '+20 128 901 2345', 48, 'Female', 'Lab Review',      '2026-09-30', '12:00', 30, 'Completed',  'Kidney function labs',           'Paid',    300, true,  '2hr',   ''),
  appt(30, 'PT-001254', 'Karim Abdallah',     '+20 103 234 5679', 19, 'Male',   'Urgent Visit',    '2026-09-30', '12:30', 30, 'Completed',  'High fever – urgent',            'Paid',    700, true,  '30min', 'Prescribed antibiotics.'),
  appt(31, 'PT-001253', 'Wafaa El-Hawary',    '+20 109 345 6780', 62, 'Female', 'Routine Visit',   '2026-09-30', '14:00', 45, 'Completed',  'Osteoporosis check',             'Paid',    450, true,  '1day',  ''),
  appt(32, 'PT-001252', 'Hesham El-Wakil',    '+20 122 456 7891', 34, 'Male',   'Follow-up',       '2026-09-30', '15:00', 30, 'Completed',  'Post knee surgery follow-up',    'Paid',    350, false, '',      ''),

  // ── September 29, 2026 ───────────────────────────────────────
  appt(33, 'PT-001284', 'Ahmed Hassan',       '+20 100 123 4567', 42, 'Male',   'Procedure',       '2026-09-29', '09:00', 60, 'Completed',  'Minor procedure',                'Paid',    1200, true, '1day',  'Procedure successful.'),
  appt(34, 'PT-001283', 'Fatma Mohamed',      '+20 101 987 6543', 35, 'Female', 'Lab Review',      '2026-09-29', '10:00', 30, 'Completed',  'Thyroid labs review',            'Paid',    300,  false,'',      ''),
  appt(35, 'PT-001282', 'Omar El-Sayed',      '+20 115 456 7890', 51, 'Male',   'Follow-up',       '2026-09-29', '10:30', 30, 'Completed',  'Diabetes insulin adjustment',    'Paid',    350,  true, '1hr',   ''),
  appt(36, 'PT-001281', 'Nour Ibrahim',       '+20 106 321 0987', 28, 'Female', 'Consultation',    '2026-09-29', '11:00', 30, 'Completed',  'Second opinion on diagnosis',    'Paid',    500,  true, '30min', ''),
  appt(37, 'PT-001277', 'Heba Mostafa',       '+20 109 444 5566', 31, 'Female', 'Routine Visit',   '2026-09-29', '12:00', 30, 'Cancelled',  'Routine check-up',               'Unpaid',  350,  true, '2hr',   'Doctor unavailable.'),
  appt(38, 'PT-001276', 'Mahmoud Samir',      '+20 122 888 9900', 57, 'Male',   'Follow-up',       '2026-09-29', '13:00', 30, 'Completed',  'Heart medication review',        'Paid',    400,  false,'',      ''),
  appt(39, 'PT-001275', 'Aya Kamal',          '+20 100 234 5678', 26, 'Female', 'New Patient',     '2026-09-29', '13:30', 45, 'Rescheduled','Initial hormonal assessment',    'Unpaid',  600,  true, '1hr',   'Rescheduled to Oct 2.'),
  appt(40, 'PT-001274', 'Sherif Naguib',      '+20 111 345 6789', 49, 'Male',   'Routine Visit',   '2026-09-29', '14:15', 30, 'Completed',  'Blood pressure monitoring',      'Paid',    350,  true, '30min', ''),

  // ── October 3, 2026 (TOMORROW) ──────────────────────────────
  appt(41, 'PT-001283', 'Fatma Mohamed',      '+20 101 987 6543', 35, 'Female', 'Follow-up',       '2026-10-03', '09:00', 30, 'Confirmed',  'Thyroid medication follow-up',   'Unpaid',  350,  true, '1hr',   ''),
  appt(42, 'PT-001280', 'Khaled Abdel-Aziz',  '+20 112 654 3210', 63, 'Male',   'Routine Visit',   '2026-10-03', '09:30', 45, 'Confirmed',  'Cardiac risk assessment',        'Unpaid',  500,  true, '1day',  ''),
  appt(43, 'PT-001278', 'Tariq El-Masry',     '+20 103 111 2233', 38, 'Male',   'Consultation',    '2026-10-03', '10:15', 30, 'Scheduled',  'Second opinion request',         'Unpaid',  500,  true, '2hr',   ''),
  appt(44, 'PT-001268', 'Youssef El-Gamal',   '+20 122 234 5671', 45, 'Male',   'Follow-up',       '2026-10-03', '11:00', 30, 'Confirmed',  'Lipid management',               'Unpaid',  350,  false,'',      ''),
  appt(45, 'PT-001267', 'Noha Badawi',        '+20 100 345 6782', 39, 'Female', 'Follow-up',       '2026-10-03', '11:30', 30, 'Scheduled',  'Post-infection follow-up',       'Unpaid',  350,  true, '1hr',   ''),
  appt(46, 'PT-001266', 'Walid Mansour',      '+20 111 456 7893', 60, 'Male',   'Lab Review',      '2026-10-03', '12:00', 30, 'Confirmed',  'Cardiac enzymes review',         'Unpaid',  300,  true, '30min', ''),
  appt(47, 'PT-001265', 'Iman Tawfik',        '+20 106 678 9014', 47, 'Female', 'Routine Visit',   '2026-10-03', '12:30', 30, 'Scheduled',  "Annual women's health check",    'Unpaid',  450,  true, '2hr',   ''),
  appt(48, 'PT-001264', 'Bassem Rizk',        '+20 115 789 0125', 36, 'Male',   'Follow-up',       '2026-10-03', '13:30', 30, 'Scheduled',  'Back pain progress review',      'Unpaid',  350,  false,'',      ''),
  appt(49, 'PT-001261', 'Layla El-Sherif',    '+20 109 234 5678', 30, 'Female', 'Teleconsultation','2026-10-03', '14:00', 30, 'Confirmed',  'Remote check-in',                'Unpaid',  400,  true, '30min', ''),

  // ── October 4, 2026 ─────────────────────────────────────────
  appt(50, 'PT-001284', 'Ahmed Hassan',       '+20 100 123 4567', 42, 'Male',   'Follow-up',       '2026-10-04', '09:00', 30, 'Scheduled',  'Monthly BP check',               'Unpaid',  350,  true, '1hr',   ''),
  appt(51, 'PT-001283', 'Fatma Mohamed',      '+20 101 987 6543', 35, 'Female', 'Procedure',       '2026-10-04', '10:00', 60, 'Confirmed',  'Minor procedure',                'Unpaid',  1200, true, '1day',  ''),
  appt(52, 'PT-001279', 'Rania Yousef',       '+20 128 777 8899', 44, 'Female', 'Consultation',    '2026-10-04', '11:00', 30, 'Scheduled',  'Nutritional advice',             'Unpaid',  500,  false,'',      ''),
  appt(53, 'PT-001282', 'Omar El-Sayed',      '+20 115 456 7890', 51, 'Male',   'Lab Review',      '2026-10-04', '11:30', 30, 'Confirmed',  'HbA1c review',                   'Unpaid',  300,  true, '2hr',   ''),
  appt(54, 'PT-001263', 'Ghada El-Rashid',    '+20 128 012 3456', 52, 'Female', 'Follow-up',       '2026-10-04', '12:00', 30, 'Scheduled',  'HRT monitoring',                 'Unpaid',  350,  true, '1hr',   ''),
  appt(55, 'PT-001260', 'Ibrahim El-Husseiny','+20 122 345 6789', 58, 'Male',   'Routine Visit',   '2026-10-04', '13:00', 45, 'Confirmed',  'Senior health check',            'Unpaid',  500,  true, '1day',  ''),
  appt(56, 'PT-001252', 'Hesham El-Wakil',    '+20 122 456 7891', 34, 'Male',   'Follow-up',       '2026-10-04', '14:00', 30, 'Scheduled',  'Knee rehab update',              'Unpaid',  350,  false,'',      ''),

  // ── October 5, 2026 ─────────────────────────────────────────
  appt(57, 'PT-001255', 'Nadia El-Gendy',     '+20 128 901 2345', 48, 'Female', 'Routine Visit',   '2026-10-05', '09:00', 30, 'Confirmed',  'Annual check',                   'Unpaid',  350,  true, '1hr',   ''),
  appt(58, 'PT-001253', 'Wafaa El-Hawary',    '+20 109 345 6780', 62, 'Female', 'Follow-up',       '2026-10-05', '09:30', 45, 'Scheduled',  'Osteoporosis treatment review',  'Unpaid',  450,  true, '1day',  ''),
  appt(59, 'PT-001256', 'Mostafa Shawky',     '+20 115 890 1234', 54, 'Male',   'Follow-up',       '2026-10-05', '10:15', 30, 'Confirmed',  'Blood pressure management',      'Unpaid',  350,  true, '30min', ''),
  appt(60, 'PT-001274', 'Sherif Naguib',      '+20 111 345 6789', 49, 'Male',   'Procedure',       '2026-10-05', '11:00', 60, 'Scheduled',  'Scheduled procedure',            'Unpaid',  1000, true, '2hr',   ''),
  appt(61, 'PT-001281', 'Nour Ibrahim',       '+20 106 321 0987', 28, 'Female', 'Follow-up',       '2026-10-05', '12:00', 30, 'Confirmed',  'Follow-up after first visit',    'Unpaid',  350,  true, '1hr',   ''),
  appt(62, 'PT-001259', 'Mariam Khalil',      '+20 100 456 7890', 23, 'Female', 'Consultation',    '2026-10-05', '12:30', 30, 'Scheduled',  'Diet and lifestyle consultation', 'Unpaid',  500,  false,'',      ''),
  appt(63, 'PT-001266', 'Walid Mansour',      '+20 111 456 7893', 60, 'Male',   'Lab Review',      '2026-10-05', '13:00', 30, 'Confirmed',  'Monthly lab results',            'Unpaid',  300,  true, '1hr',   ''),

  // ── October 6, 2026 ─────────────────────────────────────────
  appt(64, 'PT-001271', 'Dina Hamdi',         '+20 128 901 2345', 33, 'Female', 'Follow-up',       '2026-10-06', '09:30', 30, 'Scheduled',  'Nutritional progress check',     'Unpaid',  350,  true, '1hr',   ''),
  appt(65, 'PT-001270', 'Amr Salah',          '+20 103 012 3456', 22, 'Male',   'Follow-up',       '2026-10-06', '10:00', 30, 'Confirmed',  'Sports injury progress',         'Unpaid',  350,  false,'',      ''),
  appt(66, 'PT-001273', 'Mona El-Fattah',     '+20 106 567 8901', 40, 'Female', 'Lab Review',      '2026-10-06', '10:30', 30, 'Scheduled',  'Thyroid panel',                  'Unpaid',  300,  true, '2hr',   ''),
  appt(67, 'PT-001280', 'Khaled Abdel-Aziz',  '+20 112 654 3210', 63, 'Male',   'Follow-up',       '2026-10-06', '11:00', 45, 'Confirmed',  'Cardiac medication review',      'Unpaid',  400,  true, '1day',  ''),
  appt(68, 'PT-001277', 'Heba Mostafa',       '+20 109 444 5566', 31, 'Female', 'Follow-up',       '2026-10-06', '12:00', 30, 'Scheduled',  'Recovery progress check',        'Unpaid',  350,  true, '30min', ''),

  // ── October 7, 2026 ─────────────────────────────────────────
  appt(69, 'PT-001284', 'Ahmed Hassan',       '+20 100 123 4567', 42, 'Male',   'Consultation',    '2026-10-07', '09:00', 45, 'Scheduled',  'Specialist referral consult',    'Unpaid',  600,  true, '1hr',   ''),
  appt(70, 'PT-001257', 'Hana Zaki',          '+20 106 789 0123', 37, 'Female', 'Routine Visit',   '2026-10-07', '10:00', 30, 'Scheduled',  'Annual routine check',           'Unpaid',  350,  false,'',      ''),
  appt(71, 'PT-001272', 'Hassan El-Sherbini', '+20 115 678 9012', 70, 'Male',   'Follow-up',       '2026-10-07', '10:30', 45, 'Confirmed',  'Arthritis + BP combined visit',  'Unpaid',  500,  true, '1day',  ''),
  appt(72, 'PT-001261', 'Layla El-Sherif',    '+20 109 234 5678', 30, 'Female', 'Procedure',       '2026-10-07', '11:30', 60, 'Scheduled',  'Scheduled outpatient procedure', 'Unpaid',  1200, true, '2hr',   ''),

  // ── September 28, 2026 ──────────────────────────────────────
  appt(73, 'PT-001284', 'Ahmed Hassan',       '+20 100 123 4567', 42, 'Male',   'Routine Visit',   '2026-09-28', '09:00', 30, 'Completed',  'Routine visit',                  'Paid',    350,  true, '1hr',   ''),
  appt(74, 'PT-001282', 'Omar El-Sayed',      '+20 115 456 7890', 51, 'Male',   'Lab Review',      '2026-09-28', '10:00', 30, 'Completed',  'Diabetes lab review',            'Paid',    300,  false,'',      ''),
  appt(75, 'PT-001280', 'Khaled Abdel-Aziz',  '+20 112 654 3210', 63, 'Male',   'Follow-up',       '2026-09-28', '11:00', 30, 'Completed',  'Cardiac meds check',             'Paid',    400,  true, '30min', ''),
  appt(76, 'PT-001276', 'Mahmoud Samir',      '+20 122 888 9900', 57, 'Male',   'Consultation',    '2026-09-28', '12:00', 45, 'Completed',  'Second opinion',                 'Paid',    600,  true, '1hr',   ''),
  appt(77, 'PT-001268', 'Youssef El-Gamal',   '+20 122 234 5671', 45, 'Male',   'Follow-up',       '2026-09-28', '13:00', 30, 'Cancelled',  'Follow-up cancelled',            'Unpaid',  350,  true, '2hr',   'Patient request.'),
  appt(78, 'PT-001265', 'Iman Tawfik',        '+20 106 678 9014', 47, 'Female', 'Routine Visit',   '2026-09-28', '14:00', 30, 'Completed',  'Annual check',                   'Paid',    450,  false,'',      ''),
]

// ── Status → badge variant ──────────────────────────────────────
export const statusVariant: Record<AppointmentStatus, string> = {
  'Scheduled':   'neutral',
  'Confirmed':   'primary',
  'Checked In':  'info',
  'Waiting':     'warning',
  'In Progress': 'primary',
  'Completed':   'success',
  'Cancelled':   'danger',
  'No Show':     'danger',
  'Rescheduled': 'info',
}

// ── Status → accent color for calendar events ───────────────────
export const statusColor: Record<AppointmentStatus, string> = {
  'Scheduled':   '#5D7187',
  'Confirmed':   '#28B9FF',
  'Checked In':  '#4DB8FF',
  'Waiting':     '#FFCA63',
  'In Progress': '#327CFF',
  'Completed':   '#35D39A',
  'Cancelled':   '#FF667A',
  'No Show':     '#FF667A',
  'Rescheduled': '#4DB8FF',
}

// ── Type → accent color ─────────────────────────────────────────
export const typeColor: Record<AppointmentType, string> = {
  'New Patient':      '#35D39A',
  'Follow-up':        '#28B9FF',
  'Consultation':     '#9B7DFF',
  'Routine Visit':    '#4DB8FF',
  'Urgent Visit':     '#FF667A',
  'Procedure':        '#FFCA63',
  'Lab Review':       '#327CFF',
  'Teleconsultation': '#1688D4',
}

// ── Format time 24h → 12h ──────────────────────────────────────
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

// ── Format date ─────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
