import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import AppointmentForm from "../../components/appointments/AppointmentForm";
import RecordsTable from "../../components/records/RecordsTable";

const UserDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.user_type === "user") {
          // Fetch user's appointments
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from("appointments")
            .select("*, doctor:users(username)")
            .eq("patient_id", user.id)
            .order("appointment_date", { ascending: true });

          if (appointmentsError) throw appointmentsError;
          setAppointments(appointmentsData);

          // Fetch user's medical records
          const { data: recordsData, error: recordsError } = await supabase
            .from("patient_records")
            .select("record_id, diagnosis, treatment")
            .eq("patient_id", user.id)
            .order("record_id", { ascending: true });

          if (recordsError) throw recordsError;
          setRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.username}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Appointments</h2>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded p-4 hover:bg-gray-50"
                >
                  <p className="font-semibold">
                    Date: {new Date(appointment.appointment_date).toLocaleDateString()}
                  </p>
                  <p>Time: {new Date(appointment.appointment_date).toLocaleTimeString()}</p>
                  <p>Doctor: {appointment.doctor.username}</p>
                  <p>Status: {appointment.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No appointments scheduled.</p>
          )}
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Book New Appointment</h3>
            <AppointmentForm />
          </div>
        </div>

        {/* Medical Records Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Medical Records</h2>
          <RecordsTable records={records} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;