import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import RecordsTable from "../../components/records/RecordsTable";
import PatientProfileWarning from "@/components/ui/PatientProfileWarning";
import { usePatientProfile } from "@/hooks/usePatientProfile";

const UserDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("patient_id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching patient ID:", error);
          return null;
        }

        setPatientId(data.patient_id);
        return data.patient_id;
      } catch (error) {
        console.error("Error in fetchPatientId:", error);
        return null;
      }
    };

    const fetchData = async () => {
      try {
        // First get the patient_id
        const patientId = await fetchPatientId();

        if (!patientId) {
          setRecords([]);
          setPendingAppointments([]);
          setLoading(false);
          return;
        }

        // Fetch patient records using patient_id
        const { data: recordsData, error: recordsError } = await supabase
          .from("patient_records")
          .select(`
            record_id,
            diagnosis,
            treatment,
            doctors (
              name,
              specialty
            )
          `)
          .eq("patient_id", patientId)
          .order("record_id", { ascending: false });

        if (recordsError) throw recordsError;

        // Format records data to include doctor information
        const formattedRecords = recordsData.map(record => ({
          record_id: record.record_id,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          doctor: record.doctors ? `${record.doctors.name} (${record.doctors.specialty})` : 'Not Assigned'
        }));

        // Fetch pending appointments from appointment_queue
        const { data: queueData, error: queueError } = await supabase
          .from("appointment_queue")
          .select(`
            queue_id,
            reason,
            appointments!inner (
              appointment_id,
              date,
              time,
              status,
              doctors (
                name,
                specialty
              )
            )
          `)
          .eq("appointments.patient_id", patientId);

        if (queueError) throw queueError;

        // Format queue data
        const formattedAppointments = queueData.map(queue => ({
          queue_id: queue.queue_id,
          appointment_id: queue.appointments.appointment_id,
          date: queue.appointments.date,
          time: queue.appointments.time,
          status: "In Queue",
          reason: queue.reason,
          doctor: queue.appointments.doctors ? {
            name: queue.appointments.doctors.name,
            specialty: queue.appointments.doctors.specialty
          } : null
        }));

        setRecords(formattedRecords);
        setPendingAppointments(formattedAppointments);
      } catch (error) {
        console.error("Error fetching data:", error);
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
        <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
        {patientId && (
          <div className="text-sm text-gray-600">
            Patient ID: {patientId}
          </div>
        )}
      </div>

      {!patientId && <PatientProfileWarning />}

      {patientId && (
        <>
          {/* Pending Appointments Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Pending Appointments</h2>
            {pendingAppointments.length > 0 ? (
              <div className="overflow-x-auto">
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
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingAppointments.map((appointment) => (
                      <tr key={appointment.queue_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {appointment.doctor ? (
                            <div>
                              {appointment.doctor.name}
                              <span className="text-sm text-gray-500 block">
                                {appointment.doctor.specialty}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{appointment.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No pending appointments.
              </p>
            )}
          </div>

          {/* Medical Records Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Medical Records</h2>
            <RecordsTable records={records} />
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;