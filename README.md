May 25, 2025
- Updated AppointmentDashboard to support queue entries with approval and cancellation logic.
- Implemented patient profile management: added Profile and EditProfileForm components.
- Improved user experience with patient profile checks and loading indicators.
- Merged latest changes from 'may24Changes' branch.
- Refactored AppointmentDashboard and Appointments: improved data handling and state sync.
- Enhanced AppointmentForm: added dynamic time slot generation based on selected doctor and date.
- Updated appointment logic to correctly handle null doctor_id on both admin and patient sides.
- Refactored PatientInfoForm and AddPatientPopup: improved form validation and input handling.
- Removed unused appointment-related code from useAppointments hook.
- Added date picker enhancements to AppointmentForm and AppointmentDashboard.
- Renamed section headers in AddPatientPopup and AdminDashboard for clarity.
- Refined dashboard info cards styling and data display.


May 20, 2025
1. Added Appointment dashboard and routes in navigation bar in admin

05/19/2023
1. Added integration of Supabase Auth with the login and registration form
2. Login now accepts email and username
3. Fixed registration form returning null username

05/19/2023 8:56
1. Added Patient Records integration to Supabase
