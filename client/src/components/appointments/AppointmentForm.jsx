import { format } from "date-fns";
import { APPOINTMENT_TYPES } from "@/lib/constants.jsx";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import AppointmentCalendar from './AppointmentCalendar';

const AppointmentForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [doctorAvailability, setDoctorAvailability] = useState(null);
  const [formData, setFormData] = useState({
    selectedDate: '',
    selectedTime: '',
    reason: ''
  });

  // Fetch doctors and their schedules
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
          description: "Failed to load doctors list."
        });
      }
    };

    fetchDoctors();
  }, []);

  // Fetch doctor's schedule when selected
  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      if (!selectedDoctor) {
        setDoctorSchedule(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('doctor_schedule')
          .select('*')
          .eq('doctor_id', selectedDoctor)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No data found
            setDoctorSchedule(null);
          } else {
            throw error;
          }
        } else {
          setDoctorSchedule(data);
        }
      } catch (error) {
        console.error('Error fetching doctor schedule:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load doctor's schedule."
        });
      }
    };

    fetchDoctorSchedule();
  }, [selectedDoctor]);

  // Check doctor availability
  useEffect(() => {
    const checkDoctorAvailability = async () => {
      if (!selectedDoctor || !formData.selectedDate) {
        setDoctorAvailability(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('doctor_availability')
          .select('*')
          .eq('doctor_id', selectedDoctor)
          .lte('from_date', formData.selectedDate)
          .or(`to_date.is.null,to_date.gte.${formData.selectedDate}`);

        if (error) throw error;

        if (data && data.length > 0) {
          setDoctorAvailability(data[0]);
        } else {
          setDoctorAvailability(null);
        }
      } catch (error) {
        console.error('Error checking doctor availability:', error);
        setDoctorAvailability(null);
      }
    };

    checkDoctorAvailability();
  }, [selectedDoctor, formData.selectedDate]);

  const getAvailableTimeSlots = () => {
    if (!doctorSchedule) {
      // Default time slots if no doctor selected (9 AM to 5 PM)
      return Array.from({ length: 9 }, (_, i) => ({
        time: `${i + 9}:00`,
        available: true,
        label: `${i + 9}:00 ${i + 9 < 12 ? 'AM' : 'PM'}`
      }));
    }

    const [start, end] = doctorSchedule.time_slots.split('-').map(Number);
    // Add 1 to include the end time
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const hour = start + i;
      return {
        time: `${hour}:00`,
        available: true,
        label: `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedDate || !formData.selectedTime || !formData.reason?.trim()) {
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

      // Format date and time
      const appointmentDate = new Date(formData.selectedDate);
      const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
      const formattedTime = formData.selectedTime + ':00';

      // Create appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.patient_id,
          doctor_id: selectedDoctor || null,
          date: formattedDate,
          time: formattedTime,
          status: 'pending',
          reason: formData.reason.trim()
        })
        .select('appointment_id')
        .single();

      if (appointmentError) throw appointmentError;

      // Create queue entry
      const { error: queueError } = await supabase
        .from('appointment_queue')
        .insert({
          appointment_id: appointmentData.appointment_id,
          reason: formData.reason.trim()
        });

      if (queueError) {
        // Rollback appointment if queue entry fails
        await supabase
          .from('appointments')
          .delete()
          .eq('appointment_id', appointmentData.appointment_id);
        throw queueError;
      }

      toast({
        title: "Success",
        description: "Your appointment has been successfully scheduled",
      });

      // Reset form
      setFormData({
        selectedDate: '',
        selectedTime: '',
        reason: ''
      });
      setSelectedDoctor(null);

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Error submitting appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule appointment."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Doctor (Optional)
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
          value={selectedDoctor || ''}
          onChange={(e) => setSelectedDoctor(e.target.value || null)}
        >
          <option value="">Any available doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.doctor_id} value={doctor.doctor_id}>
              {doctor.name}{doctor.specialty ? ` (${doctor.specialty})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor Schedule Info */}
      {doctorSchedule && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Doctor's Working Hours:</span> {doctorSchedule.time_slots.split('-')[0]}:00 - {doctorSchedule.time_slots.split('-')[1]}:00
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <span className="font-medium">Working Days:</span> {doctorSchedule.sched.split('').map(day => {
              const days = { M: 'Mon', T: 'Tue', W: 'Wed', Th: 'Thu', F: 'Fri', St: 'Sat', Sn: 'Sun' };
              return days[day] || day;
            }).join(', ')}
          </p>
        </div>
      )}

      {/* Doctor Availability Warning */}
      {doctorAvailability && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Doctor Availability Warning
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  The selected doctor may not be available on this date. They have an unavailability period from{' '}
                  {format(new Date(doctorAvailability.from_date), 'MMMM d, yyyy')}{' '}
                  {doctorAvailability.to_date ? (
                    <>to {format(new Date(doctorAvailability.to_date), 'MMMM d, yyyy')}</>
                  ) : (
                    'onwards'
                  )}.
                </p>
                <p className="mt-1">
                  You can still proceed with the appointment, but it may need to be rescheduled or assigned to another doctor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AppointmentCalendar
        selectedDate={formData.selectedDate}
        setSelectedDate={(date) => setFormData(prev => ({ ...prev, selectedDate: date }))}
        selectedTime={formData.selectedTime}
        setSelectedTime={(time) => setFormData(prev => ({ ...prev, selectedTime: time }))}
        availableTimeSlots={getAvailableTimeSlots()}
        doctorSchedule={doctorSchedule}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Visit
        </label>
        <textarea
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
          placeholder="Briefly describe your symptoms or reason for visit"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
        ></textarea>
      </div>

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#4caf50] hover:bg-[#087f23] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  );
};

export default AppointmentForm;
