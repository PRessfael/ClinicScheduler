import { useState } from "react";
import { format } from "date-fns";

const AppointmentCalendar = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  calendarDays,
  availableTimeSlots
}) => {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const goToPreviousMonth = () => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() - 1);
    setSelectedDate(date);
  };

  const goToNextMonth = () => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() + 1);
    setSelectedDate(date);
  };

  const handleDateClick = (day) => {
    const date = new Date(selectedDate);
    date.setDate(day);
    setSelectedDate(date);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const isDayInCurrentMonth = (day) => {
    return (
      day >= 1 && day <= calendarDays.currentMonth.length
    );
  };

  return (
    <div className="appointment-calendar">
      <div className="flex justify-between items-center mb-4">
        <button
          className="text-[#1e5631] hover:text-[#143e22]"
          onClick={goToPreviousMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h3 className="text-lg font-semibold">
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h3>
        <button
          className="text-[#1e5631] hover:text-[#143e22]"
          onClick={goToNextMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Previous month days */}
        {calendarDays.previousMonth.map((day) => (
          <div key={`prev-${day}`} className="p-2 text-sm text-gray-400">
            {day}
          </div>
        ))}

        {/* Current month days */}
        {calendarDays.currentMonth.map((day) => {
          const isSelected =
            day === selectedDate.getDate() &&
            calendarDays.month === selectedDate.getMonth() &&
            calendarDays.year === selectedDate.getFullYear();
          
          const isWeekend = 
            new Date(calendarDays.year, calendarDays.month, day).getDay() === 0 ||
            new Date(calendarDays.year, calendarDays.month, day).getDay() === 6;

          return (
            <div
              key={`current-${day}`}
              className={`p-2 text-sm ${
                isSelected
                  ? "bg-[#1e5631] text-white rounded cursor-pointer"
                  : isWeekend
                  ? "text-gray-400"
                  : "cursor-pointer hover:bg-[#1e5631]/10 rounded"
              } ${isToday(day) && !isSelected ? "font-bold" : ""}`}
              onClick={() => !isWeekend && handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}

        {/* Next month days */}
        {calendarDays.nextMonth.map((day) => (
          <div key={`next-${day}`} className="p-2 text-sm text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">
          Available Time Slots - {format(selectedDate, "MMM d")}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {availableTimeSlots.map((slot, index) => (
            <button
              key={index}
              className={`${
                selectedTime === slot.time
                  ? "bg-[#1e5631] text-white"
                  : "bg-[#1e5631]/10 hover:bg-[#1e5631]/20 text-[#1e5631]"
              } py-1 px-2 rounded text-sm`}
              onClick={() => handleTimeClick(slot.time)}
              disabled={!slot.available}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
