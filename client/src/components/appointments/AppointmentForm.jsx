import { format } from "date-fns";
import { APPOINTMENT_TYPES, PROVIDERS } from "@/lib/constants.jsx";

const AppointmentForm = ({
  selectedDate,
  selectedTime,
  appointmentType,
  setAppointmentType,
  provider,
  setProvider,
  reason,
  setReason,
  formErrors = {}, // Default value to prevent undefined errors
  submitAppointment
}) => {
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
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              <option value="" disabled>
                Select appointment type
              </option>
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
              className="w-full bg-[#4caf50] hover:bg-[#087f23] text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
