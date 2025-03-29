import { APPOINTMENT_GUIDELINES } from "@/lib/constants.jsx";

const AppointmentGuidelines = () => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Guidelines</h3>
        <ul className="space-y-2 text-gray-600">
          {APPOINTMENT_GUIDELINES.map((guideline, index) => (
            <li key={index} className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#4caf50] mt-0.5 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{guideline}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AppointmentGuidelines;
