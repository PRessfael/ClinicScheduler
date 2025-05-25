import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

const AppointmentDashboard = () => {
  const [queuedAppointments, setQueuedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueuedAppointments();
  }, []);

  const fetchQueuedAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_date,
          status,
          reason,
          patient_id,
          doctor:doctors!appointments_doctor_id_fkey (
            doctor_id,
            name,
            specialty
          )
        `)
        .eq('status', 'waiting')
        .order('appointment_date', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedData = data.map(appointment => ({
        appointment_id: appointment.appointment_id,
        date: new Date(appointment.appointment_date).toISOString().split('T')[0],
        time: new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: appointment.status,
        doctors: {
          name: appointment.doctor?.name || 'Not assigned',
          specialty: appointment.doctor?.specialty || 'N/A'
        },
        reason: appointment.reason
      }));

      setQueuedAppointments(formattedData);
    } catch (error) {
      console.error('Error fetching queued appointments:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Appointment Queue</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Queue ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
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
            {queuedAppointments.map((appointment) => (
              <tr key={appointment.appointment_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.appointment_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(appointment.date), 'MMM d, yyyy')} at{' '}
                  {appointment.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.doctors?.name || 'Not assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.doctors?.specialty || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentDashboard;
