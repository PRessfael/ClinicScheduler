import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const AppointmentDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_queue')
        .select(`
          queue_id,
          appointment_id,
          reason,
          appointment:appointments(
            appointment_id,
            patient_id,
            doctor_id,
            date,
            time,
            status,
            doctor:doctors(
              doctor_id,
              name,
              specialty
            ),
            patient:patients(
              patient_id,
              first_name,
              last_name
            )
          )
        `)
        .order('queue_id', { ascending: true });

      if (error) throw error;
      setQueue(data || []);
    } catch (error) {
      console.error("Error fetching queue:", error);
      setError('Failed to load appointment queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          patient_id,
          doctor_id,
          date,
          time,
          status,
          reason,
          doctor:doctors(
            doctor_id,
            name,
            specialty
          ),
          patient:patients(
            patient_id,
            first_name,
            last_name
          )
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError('Failed to load appointments. Please try again.');
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchAppointments();
  }, []);

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

      await Promise.all([fetchQueue(), fetchAppointments()]);
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
          onClick={() => updateQueueEntry(entry.queue_id, entry.appointment.appointment_id, 'approve')}
          className="px-3 py-1 text-white text-sm rounded-md bg-green-500 hover:bg-green-600"
        >
          Approve
        </button>
        <button
          onClick={() => updateQueueEntry(entry.queue_id, entry.appointment.appointment_id, 'cancel')}
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

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Queue #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
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
              {queue.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No entries in queue
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.queue_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.queue_id}
                    </td>
                    <td className="px-6 py-4">
                      {`${item.appointment.patient.first_name} ${item.appointment.patient.last_name}`}
                    </td>
                    <td className="px-6 py-4">
                      {item.appointment.doctor ? (
                        <div>
                          {item.appointment.doctor.name}
                          <span className="text-sm text-gray-500 block">
                            {item.appointment.doctor.specialty}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No preference</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.appointment.date).toLocaleDateString()} {item.appointment.time}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.appointment.status)}`}>
                        {item.appointment.status.charAt(0).toUpperCase() + item.appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderActionButtons(item)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Appointments Table with Search */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Appointments</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
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
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No appointments found matching your search' : 'No appointments found'}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                      <td className="px-6 py-4">
                        {`${appointment.patient.first_name} ${appointment.patient.last_name}`}
                      </td>
                      <td className="px-6 py-4">
                        {appointment.doctor ? (
                          <div>
                            {appointment.doctor.name}
                            <span className="text-sm text-gray-500 block">
                              {appointment.doctor.specialty}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">No preference</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appointment.date).toLocaleDateString()} {appointment.time}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDashboard;
