import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import PatientProfileWarning from "@/components/ui/PatientProfileWarning";

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasPatientProfile, setHasPatientProfile] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for patient profile first
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("patient_id, first_name, last_name")
          .eq("user_id", user.id)
          .single();

        if (patientError || !patientData || (!patientData.first_name && !patientData.last_name)) {
          setHasPatientProfile(false);
          setAppointments([]);
          setLoading(false);
          return;
        }

        setHasPatientProfile(true);

        // Then fetch appointments
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
          .eq("patient_id", patientData.patient_id)
          .order("date", { ascending: true });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
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

      <div className="bg-white rounded-lg shadow-md p-6">
        {hasPatientProfile ? (
          appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appointment.appointment_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {appointment.doctors?.name}
                        {appointment.doctors?.specialty && (
                          <span className="text-gray-500 text-sm block">
                            {appointment.doctors.specialty}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{appointment.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              You don't have any appointments scheduled.
            </p>
          )
        ) : (
          <p className="text-gray-600 text-center py-8">
            Please complete your patient profile to schedule appointments.
          </p>
        )}
      </div>

      {showForm && (
        <AppointmentForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Appointments;
