export const SERVICES = [
  {
    title: "Easy Appointments",
    description: "Schedule and manage clinic visits online.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Medical Records Access",
    description: "View and update health history anytime.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Secure & Reliable",
    description: "Encrypted data protection and backup.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
];

export const CLINIC_SERVICES = [
  "Primary healthcare and consultations",
  "Mental health services",
  "Vaccinations and immunizations",
  "Laboratory services",
  "Sexual health services",
];

export const CLINIC_HOURS = [
  { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 2:00 PM" },
  { day: "Sunday", hours: "Closed" },
  { day: "Emergency Line", hours: "Available 24/7" },
];

export const APPOINTMENT_TYPES = [
  { value: "routine", label: "Routine Check-up" },
  { value: "urgent", label: "Urgent Care" },
  { value: "vaccination", label: "Vaccination" },
  { value: "counseling", label: "Mental Health Counseling" },
  { value: "lab", label: "Laboratory Services" },
];

export const PROVIDERS = [
  { value: "dr-smith", label: "Dr. Smith" },
  { value: "dr-johnson", label: "Dr. Johnson" },
  { value: "dr-williams", label: "Dr. Williams" },
  { value: "nurse-davis", label: "Nurse Davis" },
];

export const APPOINTMENT_GUIDELINES = [
  "Please arrive 15 minutes before your scheduled appointment time.",
  "Bring your university ID and insurance card.",
  "Cancellations should be made at least 24 hours in advance.",
  "If you're experiencing severe symptoms, please visit the emergency room instead.",
];

export const RECORD_TYPES = [
  { value: "all", label: "All Types" },
  { value: "visits", label: "Office Visits" },
  { value: "tests", label: "Lab Tests" },
  { value: "procedures", label: "Procedures" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export const DOCUMENT_TYPES = [
  { value: "lab", label: "Lab Results" },
  { value: "imaging", label: "Imaging Reports" },
  { value: "consultation", label: "Consultation Notes" },
  { value: "discharge", label: "Discharge Summary" },
  { value: "other", label: "Other" },
];

export const CONTACT_SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "appointment", label: "Appointment Question" },
  { value: "billing", label: "Billing Issue" },
  { value: "medical", label: "Medical Question" },
  { value: "feedback", label: "Feedback" },
];
