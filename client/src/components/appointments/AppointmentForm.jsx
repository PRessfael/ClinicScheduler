import { format } from "date-fns";
import { APPOINTMENT_TYPES, PROVIDERS } from "@/lib/constants.jsx";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";

const AppointmentForm = ({
  selectedDate,
  selectedTime,
  appointmentType,
  setAppointmentType,
  provider,
  setProvider,
  reason,
  setReason,
  formErrors = {},
  onSuccess
}) => {
  const { user } = useAuth();  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAppointment = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !reason) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create appointment date by combining the selected date and time
      const [hours, minutes] = selectedTime.match(/(\d+):(\d+)/).slice(1);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to make an appointment');
      }

      // Get the patient record for the current user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', user.id)
        .single();

      if (patientError) {
        throw new Error('Could not find your patient record. Please contact support.');
      }

      // Insert into appointment queue
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

      // Insert into appointments table
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          appointment_date: appointmentDateTime.toISOString(),
          appointment_type: appointmentType,
          doctor_id: provider || null,
          patient_id: patientData.patient_id,
          queue_id: queueData.queue_id,
          status: 'pending'
        });

      if (appointmentError) throw appointmentError;      // Success! Reset form and notify user
      toast({
        title: "Success",
        description: "Your appointment has been successfully scheduled",
      });

      // Reset form
      setAppointmentType('');
      setProvider('');
      setReason('');
      setSelectedTime('');
      
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
              className={`w-full px-3 py-2 border ${
                formErrors.appointmentType ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}              value={appointmentType}
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
            </label>            <select
              id="provider"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >              <option value="">No preference</option>
              {PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
              Reason for Visit
            </label>
            <textarea
              id="reason"
              rows="3"
              className={`w-full px-3 py-2 border ${
                formErrors.reason ? "border-red-500" : "border-gray-300"
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
