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
    // Placeholder data for testing
    const mockData = [
      {
        appointment_id: 1,
        date: '2025-05-21',
        time: '09:00',
        status: 'pending',
        doctors: { name: 'Dr. Smith' },
        appointment_queue: {
          queue_id: 101,
          reason: 'Regular checkup'
        }
      },
      {
        appointment_id: 2,
        date: '2025-05-21',
        time: '10:30',
        status: 'pending',
        doctors: { name: 'Dr. Jones' },
        appointment_queue: {
          queue_id: 102,
          reason: 'Follow-up visit'
        }
      },
      {
        appointment_id: 3,
        date: '2025-05-22',
        time: '14:00',
        status: 'pending',
        doctors: { name: 'Dr. Williams' },
        appointment_queue: {
          queue_id: 103,
          reason: 'Consultation for headache'
        }
      }
    ];

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQueuedAppointments(mockData);
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
