import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const AppointmentDashboard = () => {
  const { user } = useAuth();
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueueEntries();
  }, []);

  const fetchQueueEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch queue entries with their related appointment and patient information
      const { data, error } = await supabase
        .from('appointment_queue')
        .select(`
          queue_id,
          appointment_id,
          reason,
          appointments!inner (
            appointment_id,
            patient_id,
            doctor_id,
            date,
            time,
            status,
            doctors:doctor_id (
              doctor_id,
              name,
              specialty
            ),
            patients:patient_id (
              patient_id,
              first_name,
              last_name
            )
          )
        `)
        .order('queue_id', { ascending: true });

      if (error) throw error;

      // Format the data for display
      const formattedEntries = (data || []).map(entry => ({
        queue_id: entry.queue_id,
        appointment_id: entry.appointment_id,
        reason: entry.reason,
        date: entry.appointments.date,
        time: entry.appointments.time,
        status: entry.appointments.status,
        patient: entry.appointments.patients,
        doctor: entry.appointments.doctors
      }));

      setQueueEntries(formattedEntries);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Failed to load appointment queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQueueEntry = async (queueId, appointmentId, action) => {
    try {
      setLoading(true);
      
      // Update appointment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: action === 'approve' ? 'confirmed' : 'cancelled' })
        .eq('appointment_id', appointmentId);

      if (appointmentError) throw appointmentError;

      // Remove from queue after updating status
      const { error: queueError } = await supabase
        .from('appointment_queue')
        .delete()
        .eq('queue_id', queueId);

      if (queueError) throw queueError;

      await fetchQueueEntries();
    } catch (err) {
      console.error('Error updating queue entry:', err);
      setError(`Failed to ${action} queue entry. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderActionButtons = (entry) => {
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => updateQueueEntry(entry.queue_id, entry.appointment_id, 'approve')}
          className="px-3 py-1 text-white text-sm rounded-md bg-green-500 hover:bg-green-600"
        >
          Approve
        </button>
        <button
          onClick={() => updateQueueEntry(entry.queue_id, entry.appointment_id, 'cancel')}
          className="px-3 py-1 text-white text-sm rounded-md bg-red-500 hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointment Queue</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Queue #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queueEntries.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No entries in queue
                </td>
              </tr>
            ) : (
              queueEntries.map((entry) => (
                <tr key={entry.queue_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.queue_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(entry.date), 'MMM d, yyyy')} at {entry.time.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.patient
                      ? `${entry.patient.first_name} ${entry.patient.last_name}`
                      : 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.doctor?.name || 'Not assigned'}
                    {entry.doctor?.specialty && (
                      <span className="text-gray-500 text-xs block">
                        {entry.doctor.specialty}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(entry.status)}`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderActionButtons(entry)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentDashboard;
