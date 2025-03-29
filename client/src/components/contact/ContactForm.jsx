import { useState } from "react";
import { CONTACT_SUBJECTS } from "@/lib/constants.jsx";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    privacyConsent: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!formData.subject) errors.subject = "Please select a subject";
    if (!formData.message.trim()) errors.message = "Message is required";
    if (!formData.privacyConsent) errors.privacyConsent = "You must agree to the privacy policy";
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Submit form - in a real app would send to API
      alert("Your message has been sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        privacyConsent: false
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Us a Message</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first-name">
                First Name
              </label>
              <input
                type="text"
                id="first-name"
                name="firstName"
                className={`w-full px-3 py-2 border ${formErrors.firstName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last-name">
                Last Name
              </label>
              <input
                type="text"
                id="last-name"
                name="lastName"
                className={`w-full px-3 py-2 border ${formErrors.lastName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full px-3 py-2 border ${formErrors.email ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              placeholder="Your email address"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="subject">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className={`w-full px-3 py-2 border ${formErrors.subject ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              value={formData.subject}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {CONTACT_SUBJECTS.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
            {formErrors.subject && (
              <p className="mt-1 text-sm text-red-500">{formErrors.subject}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className={`w-full px-3 py-2 border ${formErrors.message ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              placeholder="How can we help you?"
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            {formErrors.message && (
              <p className="mt-1 text-sm text-red-500">{formErrors.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="privacy"
                name="privacyConsent"
                type="checkbox"
                className={`h-4 w-4 text-[#1e5631] focus:ring-[#1e5631] border-gray-300 rounded ${formErrors.privacyConsent ? "border-red-500" : ""}`}
                checked={formData.privacyConsent}
                onChange={handleChange}
              />
              <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-[#1e5631] hover:underline">
                  privacy policy
                </a>{" "}
                and consent to being contacted regarding my inquiry.
              </label>
            </div>
            {formErrors.privacyConsent && (
              <p className="mt-1 text-sm text-red-500">{formErrors.privacyConsent}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full bg-[#4caf50] hover:bg-[#087f23] text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
