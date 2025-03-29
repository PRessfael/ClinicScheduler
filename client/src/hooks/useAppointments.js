import { useState } from 'react';

export function useAppointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState('');
  const [provider, setProvider] = useState('');
  const [reason, setReason] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Days formatting for calendar display
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getPreviousMonthDays = (year, month) => {
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = [];
    
    if (firstDay > 0) {
      const daysInPrevMonth = getDaysInMonth(year, month - 1);
      for (let i = 0; i < firstDay; i++) {
        prevMonthDays.unshift(daysInPrevMonth - i);
      }
    }
    
    return prevMonthDays;
  };

  const getCurrentMonthDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getNextMonthDays = (year, month) => {
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const nextMonthDays = [];
    
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - (firstDay + daysInMonth);
    
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push(i);
    }
    
    return nextMonthDays;
  };

  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    return {
      previousMonth: getPreviousMonthDays(year, month),
      currentMonth: getCurrentMonthDays(year, month),
      nextMonth: getNextMonthDays(year, month),
      year,
      month
    };
  };

  // Available time slots for the selected date
  const getAvailableTimeSlots = () => {
    return [
      { time: '9:00 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '11:00 AM', available: true },
      { time: '1:00 PM', available: true },
      { time: '2:00 PM', available: true },
      { time: '3:00 PM', available: true },
    ];
  };

  // Form submission handler
  const submitAppointment = () => {
    const errors = {};
    
    if (!appointmentType) errors.appointmentType = 'Please select an appointment type';
    if (!selectedDate) errors.date = 'Please select a date';
    if (!selectedTime) errors.time = 'Please select a time';
    if (!reason.trim()) errors.reason = 'Please provide a reason for your visit';
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // In a real app, we would submit to an API here
      alert(`Appointment scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
      
      // Reset form
      setAppointmentType('');
      setProvider('');
      setReason('');
      setSelectedTime(null);
      
      return true;
    }
    
    return false;
  };

  return {
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
    formErrors,
    getCalendarDays,
    getAvailableTimeSlots,
    submitAppointment
  };
}
