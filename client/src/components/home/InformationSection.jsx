import { CLINIC_SERVICES, CLINIC_HOURS } from "@/lib/constants.jsx";

const InformationSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">University Health Services</h2>
        <p className="text-gray-600 mb-4">
          Our clinic provides comprehensive healthcare services to all university students, faculty, and staff. 
          We offer a wide range of medical services, from routine check-ups to specialized care.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#4caf50] mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Services Offered
            </h3>
            <ul className="text-gray-600 space-y-2 ml-7">
              {CLINIC_SERVICES.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#4caf50] mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Clinic Hours
            </h3>
            <ul className="text-gray-600 space-y-2 ml-7">
              {CLINIC_HOURS.map((hour, index) => (
                <li key={index}>
                  <span className="font-medium">{hour.day}:</span> {hour.hours}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationSection;
