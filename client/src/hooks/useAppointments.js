import { useState } from "react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state with default values
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [provider, setProvider] = useState("");
  const [reason, setReason] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // ✅ Fetch appointments with optional filters
  const fetchAppointments = async (filter = {}) => {
    setLoading(true);
    setError(null);

    try {
      const query = supabase
        .from("appointments")
        .select(`
          *,
          doctors:doctor_id (
            doctor_id,
            name,
            specialty
          )
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (filter.patient_id) query.eq("patient_id", filter.patient_id);
      if (filter.doctor_id) query.eq("doctor_id", filter.doctor_id);

      const { data, error } = await query;
      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new appointment (no need to pass appointment_id)
  const addAppointment = async ({ patient_id, doctor_id, date, time, status }) => {
    const { error } = await supabase.from("appointments").insert([
      {
        patient_id,
        doctor_id,
        date,
        time,
        status, // must be one of: 'pending', 'confirmed', 'cancelled', 'completed'
      },
    ]);

    if (error) throw new Error(error.message);

    await fetchAppointments(); // Optional: refresh data
  };

  // ✅ Update appointment status
  const updateStatus = async (appointment_id, newStatus) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("appointment_id", appointment_id);

    if (error) throw new Error(error.message);

    await fetchAppointments();
  };

  // ✅ Delete appointment
  const deleteAppointment = async (appointment_id) => {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("appointment_id", appointment_id);

    if (error) throw new Error(error.message);

    await fetchAppointments();
  };

  // Calendar helper functions
  const getCalendarDays = () => {
    const today = new Date(selectedDate);
    const month = today.getMonth();
    const year = today.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      previousMonth: Array.from({ length: firstDay.getDay() }, (_, i) => {
        const day = new Date(year, month, 0 - i).getDate();
        return day;
      }).reverse(),
      currentMonth: Array.from(
        { length: lastDay.getDate() },
        (_, i) => i + 1
      ),
      nextMonth: Array.from(
        { length: 6 - lastDay.getDay() },
        (_, i) => i + 1
      ),
      month,
      year
    };
  };

  const getAvailableTimeSlots = () => {
    // This would ideally fetch from the server to check actual availability
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({ time: `${hour}:00`, available: true });
      slots.push({ time: `${hour}:30`, available: true });
    }

    return slots;
  };

  // Form submission handler
  const submitAppointment = async () => {
    const errors = {};

    if (!selectedDate) errors.date = 'Please select a date';
    if (!selectedTime) errors.time = 'Please select a time';
    if (!reason.trim()) errors.reason = 'Please provide a reason for your visit';

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('You must be logged in to make an appointment');
        }

        // Create appointment date by combining the selected date and time
        const [hours, minutes] = selectedTime.match(/(\d+):(\d+)/).slice(1);
        const appointmentDateTime = new Date(selectedDate);
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Get the patient record for the current user
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('patient_id')
          .eq('user_id', user.id)
          .single();

        if (patientError) {
          throw new Error('Could not find your patient record. Please contact support.');
        }

        // Insert into appointment queue first
        const { data: queueData, error: queueError } = await supabase
          .from('appointment_queue')
          .insert({
            appointment_date: appointmentDateTime.toISOString(),
            patient_id: patientData.patient_id,
            status: 'waiting',
            reason: reason
          })
          .select()
          .single();

        if (queueError) throw queueError;

        // Then insert into appointments table with patient_id and queue_id
        const { error } = await supabase
          .from('appointments')
          .insert({
            date: format(appointmentDateTime, 'yyyy-MM-dd'),
            time: format(appointmentDateTime, 'HH:mm:ss'),
            doctor_id: provider || null,
            patient_id: patientData.patient_id,
            status: 'pending',
            reason: reason.trim()
          });

        if (error) throw error;

        // Reset form
        setProvider('');
        setReason('');
        setSelectedTime('');

        return true;
      } catch (error) {
        console.error('Error submitting appointment:', error);
        setFormErrors({ submit: error.message || 'Failed to submit appointment. Please try again.' });
        return false;
      }
    }

    return false;
  };

  return {
    // Appointment data and operations
    appointments,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    updateStatus,
    deleteAppointment,

    // Form state
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    provider,
    setProvider,
    reason,
    setReason,
    formErrors,
    setFormErrors,

    // Helper functions
    getCalendarDays,
    getAvailableTimeSlots,

    // Submit handler
    submitAppointment,
  };
};
