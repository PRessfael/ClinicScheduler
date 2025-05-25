import { format } from "date-fns";
import { APPOINTMENT_TYPES } from "@/lib/constants.jsx";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";

const AppointmentForm = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  appointmentType,
  setAppointmentType,
  provider,
  setProvider,
  reason,
  setReason,
  formErrors = {},
  onSuccess
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
    }

    return slots;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('doctor_id, name, specialty')
          .order('name');

        if (error) throw error;
        setDoctors(data || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load doctors list. Please try again later."
        });
      }
    };

    fetchDoctors();
  }, []);

  const submitAppointment = async () => {
    if (!selectedDate || !selectedTime || !reason?.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the patient record for the current user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', user.id)
        .single();

      if (patientError) {
        throw new Error('Could not find your patient record. Please complete your profile first.');
      }

      // Format date and time according to PostgreSQL requirements
      const appointmentDate = new Date(selectedDate);
      const formattedDate = format(appointmentDate, 'yyyy-MM-dd'); // date type
      const formattedTime = selectedTime + ':00'; // time without time zone type

      // First create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.patient_id,
          doctor_id: provider || null,
          date: formattedDate,
          time: formattedTime,
          status: 'pending',
          reason: reason.trim()
        })
        .select('appointment_id')
        .single();

      if (appointmentError) {
        console.error('Appointment creation error:', appointmentError);
        throw new Error('Failed to create appointment. Please try again.');
      }

      // Then create the queue entry
      const { error: queueError } = await supabase
        .from('appointment_queue')
        .insert({
          appointment_id: appointmentData.appointment_id,
          reason: reason.trim()
        });

      if (queueError) {
        // If queue entry fails, we should delete the appointment
        await supabase
          .from('appointments')
          .delete()
          .eq('appointment_id', appointmentData.appointment_id);

        throw new Error('Failed to queue appointment. Please try again.');
      }

      toast({
        title: "Success",
        description: "Your appointment has been successfully scheduled",
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Error submitting appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule appointment. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAppointment();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="apt-type">
              Appointment Type
            </label>
            <select
              id="apt-type"
              className={`w-full px-3 py-2 border ${formErrors.appointmentType ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              <option value="">Select appointment type</option>
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formErrors.appointmentType && (
              <p className="mt-1 text-sm text-red-500">{formErrors.appointmentType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="provider">
              Preferred Provider (Optional)
            </label>
            <select
              id="provider"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="">No preference</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.name}{doctor.specialty ? ` (${doctor.specialty})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
              Preferred Time
            </label>
            <select
              id="time"
              className={`w-full px-3 py-2 border ${formErrors.time ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Select time</option>
              {generateTimeSlots().map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {formErrors.time && (
              <p className="mt-1 text-sm text-red-500">{formErrors.time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
              Reason for Visit
            </label>
            <textarea
              id="reason"
              rows="3"
              className={`w-full px-3 py-2 border ${formErrors.reason ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              placeholder="Briefly describe your symptoms or reason for visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
            {formErrors.reason && (
              <p className="mt-1 text-sm text-red-500">{formErrors.reason}</p>
            )}
          </div>

          {selectedDate && selectedTime && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800 font-medium">Selected Appointment:</p>
              <p className="text-sm text-blue-800">
                {format(selectedDate, "MMMM d, yyyy")} at {selectedTime}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4caf50] hover:bg-[#087f23] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
