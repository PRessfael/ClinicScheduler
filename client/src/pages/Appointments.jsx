import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import PatientProfileWarning from "@/components/ui/PatientProfileWarning";
import { usePatientProfile } from "@/hooks/usePatientProfile";
import { useAppointments } from "@/hooks/useAppointments";

const Appointments = () => {
  const { user } = useAuth();
  const { patientProfile, hasPatientProfile, isLoading } = usePatientProfile();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
  } = useAppointments();

  const fetchAppointments = async () => {
    if (!hasPatientProfile || !patientProfile?.patient_id) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          appointment_id,
          date,
          time,
          status,
          reason,
          doctor:doctors(
            name,
            specialty
          )
        `)
        .eq("patient_id", patientProfile.patient_id)
        .order("date", { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [hasPatientProfile, patientProfile]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        {hasPatientProfile && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#1e5631] text-white px-6 py-2 rounded-md hover:bg-[#143e22] transition-colors"
          >
            Book Appointment
          </button>
        )}
      </div>

      {!hasPatientProfile && <PatientProfileWarning />}

      {hasPatientProfile && (
        <>
          {showForm && (
            <AppointmentForm
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              provider={provider}
              setProvider={setProvider}
              reason={reason}
              setReason={setReason}
              formErrors={formErrors}
              onSuccess={() => {
                setShowForm(false);
                fetchAppointments();
              }}
            />
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Appointment History</h2>
            {appointments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appointment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.doctor?.name || "Not assigned"}
                        {appointment.doctor?.specialty && (
                          <span className="text-gray-500 text-sm block">
                            {appointment.doctor.specialty}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No appointments found.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Appointments;
