import { useState } from "react";
import { format, isWeekend } from "date-fns";

const AppointmentCalendar = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableTimeSlots,
  doctorSchedule
}) => {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousMonth = () => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - 1);
    setCurrentDate(date);
  };

  const goToNextMonth = () => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    setCurrentDate(date);
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate);
    date.setDate(day);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isDayAvailable = (day) => {
    if (!doctorSchedule) return true;

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = format(date, 'EEEE').toLowerCase();

    // Convert schedule string to array of available days
    const schedDays = doctorSchedule.sched.split('');
    const availableDays = schedDays.map(day => {
      switch (day) {
        case 'M': return 'monday';
        case 'T': return 'tuesday';
        case 'W': return 'wednesday';
        case 'Th': return 'thursday';
        case 'F': return 'friday';
        case 'St': return 'saturday';
        case 'Sn': return 'sunday';
        default: return '';
      }
    });

    return availableDays.includes(dayOfWeek);
  };

  // Calculate calendar days
  const getCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const previousMonthDays = [];
    const currentMonthDays = [];
    const nextMonthDays = [];

    // Previous month days
    const firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek > 0) {
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      const previousMonthLastDay = previousMonth.getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        previousMonthDays.push(previousMonthLastDay - i);
      }
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      currentMonthDays.push(day);
    }

    // Next month days
    const remainingDays = 42 - (previousMonthDays.length + currentMonthDays.length);
    for (let day = 1; day <= remainingDays; day++) {
      nextMonthDays.push(day);
    }

    return {
      previousMonth: previousMonthDays,
      currentMonth: currentMonthDays,
      nextMonth: nextMonthDays,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear()
    };
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="appointment-calendar space-y-6">
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
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
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
          const date = new Date(calendarDays.year, calendarDays.month, day);
          const isSelected = selectedDate === format(date, 'yyyy-MM-dd');
          const isUnavailable = !isDayAvailable(day);
          const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <div
              key={`current-${day}`}
              className={`p-2 text-sm ${isSelected
                ? "bg-[#1e5631] text-white rounded"
                : isUnavailable || isPastDate
                  ? "text-gray-400 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[#1e5631]/10 rounded"
                } ${isToday(day) && !isSelected ? "font-bold" : ""}`}
              onClick={() => !isUnavailable && !isPastDate && handleDateClick(day)}
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

      {/* Time Slots */}
      {selectedDate && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2">
            Available Time Slots - {format(new Date(selectedDate), "MMM d")}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTimeSlots.map((slot, index) => (
              <button
                key={index}
                className={`${selectedTime === slot.time
                    ? "bg-[#1e5631] text-white"
                    : "bg-[#1e5631]/10 hover:bg-[#1e5631]/20 text-[#1e5631]"
                  } w-full py-2 px-3 rounded text-sm flex items-center justify-between ${!slot.available ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                onClick={() => slot.available && handleTimeClick(slot.time)}
                disabled={!slot.available}
              >
                <span>{slot.time}</span>
                {selectedTime === slot.time && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
