import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const UserDashboard = () => {
  const { user } = useAuth();
  
  // Sample appointment data
  const [appointments, setAppointments] = useState([
    { id: 1, doctorName: "Dr. Smith", department: "Cardiology", date: "2023-05-10", time: "10:00 AM", status: "upcoming" },
    { id: 2, doctorName: "Dr. Johnson", department: "Dermatology", date: "2023-05-15", time: "2:30 PM", status: "upcoming" },
    { id: 3, doctorName: "Dr. Williams", department: "General Medicine", date: "2023-04-20", time: "9:15 AM", status: "completed" },
    { id: 4, doctorName: "Dr. Davis", department: "Neurology", date: "2023-04-05", time: "11:45 AM", status: "completed" }
  ]);

  // Available time slots for new appointments
  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, doctorName: "Dr. Smith", department: "Cardiology", date: "2023-05-20", time: "9:00 AM" },
    { id: 2, doctorName: "Dr. Smith", department: "Cardiology", date: "2023-05-20", time: "10:00 AM" },
    { id: 3, doctorName: "Dr. Johnson", department: "Dermatology", date: "2023-05-22", time: "1:00 PM" },
    { id: 4, doctorName: "Dr. Johnson", department: "Dermatology", date: "2023-05-22", time: "2:00 PM" },
    { id: 5, doctorName: "Dr. Williams", department: "General Medicine", date: "2023-05-21", time: "11:30 AM" }
  ]);

  // Form state for new appointment
  const [formData, setFormData] = useState({
    department: "",
    doctor: "",
    date: "",
    reason: ""
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit the form data to the server
    alert("Appointment request submitted!");
    setFormData({
      department: "",
      doctor: "",
      date: "",
      reason: ""
    });
  };

  // Filter appointments
  const upcomingAppointments = appointments.filter(apt => apt.status === "upcoming");
  const pastAppointments = appointments.filter(apt => apt.status === "completed");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Appointments Dashboard</h1>
        <div className="bg-[#1e5631] text-white px-4 py-2 rounded-lg">
          Welcome, {user?.username || "User"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
            </div>
            <div className="p-6">
              {upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {upcomingAppointments.map(apt => (
                    <div key={apt.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{apt.doctorName}</h3>
                          <p className="text-sm text-gray-500">{apt.department}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Upcoming
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-700">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{apt.date} at {apt.time}</span>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button type="button" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-[#1e5631] hover:bg-[#0d401d]">
                          Reschedule
                        </button>
                        <button type="button" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-[#1e5631] bg-[#1e5631]/10 hover:bg-[#1e5631]/20">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming appointments</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Appointment History</h2>
            </div>
            <div className="p-6">
              {pastAppointments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {pastAppointments.map(apt => (
                    <div key={apt.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{apt.doctorName}</h3>
                          <p className="text-sm text-gray-500">{apt.department}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Completed
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-700">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{apt.date} at {apt.time}</span>
                      </div>
                      <div className="mt-4">
                        <button type="button" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-[#1e5631] bg-[#1e5631]/10 hover:bg-[#1e5631]/20">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No appointment history</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Book Appointment */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-[#1e5631] px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Book an Appointment</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm border p-2"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="general">General Medicine</option>
                    <option value="neurology">Neurology</option>
                    <option value="pediatrics">Pediatrics</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor
                  </label>
                  <select
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleFormChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm border p-2"
                    required
                  >
                    <option value="">Select Doctor</option>
                    <option value="dr_smith">Dr. Smith</option>
                    <option value="dr_johnson">Dr. Johnson</option>
                    <option value="dr_williams">Dr. Williams</option>
                    <option value="dr_davis">Dr. Davis</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm border p-2"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleFormChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm border p-2"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e5631] hover:bg-[#0d401d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5631]"
                >
                  Request Appointment
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Available Time Slots</h2>
            </div>
            <div className="p-4">
              <div className="divide-y divide-gray-200">
                {availableSlots.map(slot => (
                  <div key={slot.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium text-gray-900">{slot.doctorName}</p>
                    <p className="text-sm text-gray-500">{slot.department}</p>
                    <div className="mt-1 flex items-center text-sm text-gray-700">
                      <span>{slot.date} at {slot.time}</span>
                    </div>
                    <button className="mt-2 text-xs bg-[#1e5631] text-white py-1 px-2 rounded hover:bg-[#0d401d]">
                      Book this slot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;