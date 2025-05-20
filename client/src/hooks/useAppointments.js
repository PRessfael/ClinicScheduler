import { useState } from "react";
import { supabase } from "../lib/supabase";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch appointments with optional filters
  const fetchAppointments = async (filter = {}) => {
    setLoading(true);
    setError(null);

    try {
      const query = supabase
        .from("appointments")
        .select("*")
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

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    updateStatus,
    deleteAppointment,
  };
};
