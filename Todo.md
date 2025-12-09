

December 5, 2025 Changes:

- Allow doctors to set unavailability for specific time blocks (date, start time, end time) in the UI
- Update DoctorAvailabilityTable and AddSchedulePopup for time-blocked entries
- Patch backend and schema to support start_time and end_time (instructions provided)
- Show unavailable time blocks in appointment warnings, formatted as AM/PM
- Fix working days display to correctly parse two-character codes (Th, St, Sn)
- Remove seconds from time display in warnings
- General UI/UX improvements for scheduling and availability
"


- Allow doctors to set unavailability for specific time blocks (date, start time, end time) in the UI:
    Make when whole days e.g. 2 days timeoff it doesnt require time blocks or default it to the whole days

- Fix the doctor schedule and reflect it in the calendar for doctors

