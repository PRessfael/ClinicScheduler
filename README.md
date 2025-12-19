# Digital Medical Record and Appointment System for University Clinic

This web-based system streamlines appointment scheduling and patient record management for university clinics. It features role-based access for administrators, doctors, and patients, allowing efficient handling of medical appointments, digital records, and patient information.

## Key Features
- Role-based access and dashboards (Admin, Doctor, Patient)
- Secure authentication with Supabase (email or username login)
- Protected routes with role-aware guards
- Appointment booking with doctor availability and dynamic time slots
- Patient queue management with approve/cancel and status updates
- Digital medical records: upload, preview, and manage
- Patient profile management: view, edit, change password
- Doctor schedules and availability management
- Responsive UI using Tailwind CSS and shadcn/ui components
- Clear validations, toasts, and loading states for better UX


## Updates
December 19, 2025
- Added route protection via [client/src/components/auth/ProtectedRoute.jsx](client/src/components/auth/ProtectedRoute.jsx) and enforced role-based redirects.
- Polished schedules management: [client/src/components/ui/DoctorAvailabilityTable.jsx](client/src/components/ui/DoctorAvailabilityTable.jsx), [client/src/components/ui/DoctorScheduleTable.jsx](client/src/components/ui/DoctorScheduleTable.jsx).
- Improved records experience: [client/src/components/records/RecordsUpload.jsx](client/src/components/records/RecordsUpload.jsx), [client/src/components/records/RecordsTable.jsx](client/src/components/records/RecordsTable.jsx).
- Refined appointment flow: dynamic time slots per doctor/date and better null `doctor_id` handling across admin/patient screens.
- UX: clearer toasts, loading states, and form validation in [client/src/components/ui/AddPatientPopup.jsx](client/src/components/ui/AddPatientPopup.jsx) and [client/src/components/profile/EditProfileForm.jsx](client/src/components/profile/EditProfileForm.jsx).
- Docs: updated Key Features and consolidated updates.


