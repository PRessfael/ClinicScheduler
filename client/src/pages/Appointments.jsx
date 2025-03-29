import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import AppointmentGuidelines from "@/components/appointments/AppointmentGuidelines";
import { useAppointments } from "@/hooks/useAppointments";

const Appointments = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    appointmentType,
    setAppointmentType,
    provider,
    setProvider,
    reason,
    setReason,
    formErrors,
    getCalendarDays,
    getAvailableTimeSlots,
    submitAppointment
  } = useAppointments();

  return (
    <section id="appointments" className="bg-[#f5f5f5] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Schedule an Appointment
          </h2>

          {/* Appointment Scheduler */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Calendar View */}
              <div className="md:w-1/2 p-6 border-r border-gray-200">
                <AppointmentCalendar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  calendarDays={getCalendarDays()}
                  availableTimeSlots={getAvailableTimeSlots()}
                />
              </div>

              {/* Appointment Form */}
              <div className="md:w-1/2 p-6">
                <AppointmentForm
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  appointmentType={appointmentType}
                  setAppointmentType={setAppointmentType}
                  provider={provider}
                  setProvider={setProvider}
                  reason={reason}
                  setReason={setReason}
                  formErrors={formErrors}
                  submitAppointment={submitAppointment}
                />
              </div>
            </div>
          </div>

          {/* Appointment Guidelines */}
          <AppointmentGuidelines />
        </div>
      </div>
    </section>
  );
};

export default Appointments;
