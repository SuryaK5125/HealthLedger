// Static, frontend-only sample data for "View Demo" mode.
//
// Nothing here is ever sent to or read from the real backend — these are
// plain objects shaped exactly like the JSON the API already returns, so
// every existing page can render them with zero changes to its display
// logic. IDs are fake, human-readable strings (not real Mongo ObjectIds)
// since they never leave the browser.
//
// Appointment and record dates are computed relative to "now" at load time
// (not hardcoded), so the demo always shows upcoming appointments and
// recent activity no matter when it's viewed.

function daysFromNow(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

export const demoProfiles = [
  {
    _id: "demo-profile-arjun",
    name: "Arjun Nair",
    relationship: "Self",
    dob: "1992-06-14",
    gender: "Male",
    bloodGroup: "O+",
  },
  {
    _id: "demo-profile-lakshmi",
    name: "Lakshmi Nair",
    relationship: "Mother",
    dob: "1966-11-02",
    gender: "Female",
    bloodGroup: "A+",
  },
  {
    _id: "demo-profile-ramesh",
    name: "Ramesh Nair",
    relationship: "Father",
    dob: "1963-04-20",
    gender: "Male",
    bloodGroup: "B+",
  },
];

export const demoMedications = [
  {
    _id: "demo-med-1",
    profileId: "demo-profile-arjun",
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "Once daily",
    startDate: "2026-01-10",
    endDate: null,
  },
  {
    _id: "demo-med-2",
    profileId: "demo-profile-lakshmi",
    name: "Amlodipine",
    dosage: "5 mg",
    frequency: "Once daily",
    startDate: "2025-09-01",
    endDate: null,
  },
  {
    _id: "demo-med-3",
    profileId: "demo-profile-lakshmi",
    name: "Calcium + Vitamin D",
    dosage: "600 mg",
    frequency: "Once daily",
    startDate: "2025-09-01",
    endDate: null,
  },
  {
    _id: "demo-med-4",
    profileId: "demo-profile-ramesh",
    name: "Metformin",
    dosage: "500 mg",
    frequency: "Twice daily",
    startDate: "2025-03-15",
    endDate: null,
  },
];

export const demoAppointments = [
  {
    _id: "demo-appt-1",
    profileId: "demo-profile-arjun",
    doctor: "Dr. Ananya Iyer",
    specialty: "General Medicine",
    location: "Harborview Clinic",
    date: daysFromNow(15),
    notes: "Annual wellness check-up.",
  },
  {
    _id: "demo-appt-2",
    profileId: "demo-profile-lakshmi",
    doctor: "Dr. Meera Shah",
    specialty: "Cardiology",
    location: "Maple Grove Medical Centre",
    date: daysFromNow(22),
    notes: "Follow-up on blood pressure management.",
  },
  {
    _id: "demo-appt-3",
    profileId: "demo-profile-ramesh",
    doctor: "Dr. Karthik Rao",
    specialty: "Endocrinology",
    location: "Riverside Health Centre",
    date: daysFromNow(29),
    notes: "Quarterly diabetes review.",
  },
];

// No cloudinaryUrl on any of these — that absence is what tells RecordsList
// to render a static, non-interactive file card instead of an image or a
// link to a real hosted file.
export const demoRecords = [
  {
    _id: "demo-record-1",
    profileId: "demo-profile-arjun",
    type: "Annual Blood Test",
    notes: "Routine annual panel — all values within normal range.",
    uploadDate: daysFromNow(-3),
    resourceType: "raw",
    cloudinaryUrl: null,
  },
  {
    _id: "demo-record-2",
    profileId: "demo-profile-ramesh",
    type: "Prescription",
    notes: "Metformin 500mg — refill, twice daily with meals.",
    uploadDate: daysFromNow(-5),
    resourceType: "raw",
    cloudinaryUrl: null,
  },
  {
    _id: "demo-record-3",
    profileId: "demo-profile-lakshmi",
    type: "Blood Pressure Report",
    notes: "Home monitoring log for the past 30 days.",
    uploadDate: daysFromNow(-1),
    resourceType: "raw",
    cloudinaryUrl: null,
  },
  {
    _id: "demo-record-4",
    profileId: "demo-profile-ramesh",
    type: "Diabetes Follow-up Report",
    notes: "HbA1c trending down since last quarter.",
    uploadDate: daysFromNow(-6),
    resourceType: "raw",
    cloudinaryUrl: null,
  },
];
