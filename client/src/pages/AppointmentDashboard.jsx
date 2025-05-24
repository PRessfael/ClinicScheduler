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
        .from('appointment_queue')
        .select(`
          queue_id,
          appointment_date,
          status,
          reason,
          patient_id,
          appointment:appointments (
            appointment_id,
            doctor:doctor_id (
              username
            )
          )
        `)
        .eq('status', 'waiting')
        .order('appointment_date', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedData = data.map(queue => ({
        appointment_id: queue.appointment?.appointment_id,
        date: new Date(queue.appointment_date).toISOString().split('T')[0],
        time: new Date(queue.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: queue.status,
        doctors: { name: queue.appointment?.doctor?.username || 'Not assigned' },
        appointment_queue: {
          queue_id: queue.queue_id,
          reason: queue.reason
        }
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queuedAppointments.map((appointment) => (
              <tr key={appointment.appointment_queue.queue_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.appointment_queue.queue_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(appointment.date), 'MMM d, yyyy')} at{' '}
                  {appointment.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.doctors?.name || 'Not assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.appointment_queue.reason}
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
