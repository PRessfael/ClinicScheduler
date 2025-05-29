import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AddPatientPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    firstName: "",
    lastName: "",
    age: "",
    diagnosis: "",
    treatment: "",
    doctorId: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isExistingPatient, setIsExistingPatient] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Fetch available doctors
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from("doctors")
          .select("doctor_id, name, specialty")
          .order("name");

        if (error) throw error;
        setDoctors(data || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      if (searchQuery.length < 2) {
        setPatientOptions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("patients")
          .select(`
            patient_id,
            first_name,
            last_name,
            user_id,
            users (
              username
            )
          `)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) throw error;

        const formattedOptions = data.map((patient) => ({
          id: patient.patient_id,
          name: `${patient.first_name} ${patient.last_name}`,
          username: patient.users?.username
        }));

        setPatientOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching patient options:", error);
      }
    };

    fetchPatients();
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!isExistingPatient) {
      if (!formData.firstName?.trim()) errors.firstName = "First name is required";
      if (!formData.lastName?.trim()) errors.lastName = "Last name is required";
      if (!formData.age) errors.age = "Age is required";
    } else if (!formData.patientId) {
      errors.patientId = "Please select a patient";
    }
    if (!formData.diagnosis?.trim()) errors.diagnosis = "Diagnosis is required";
    return errors;
  };

  const handleSave = async () => {
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (!isExistingPatient) {
        // Generate a patient ID in format P + YYMMDDxxxx (where xxxx is random)
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newPatientId = `P${year}${month}${day}${random}`.substring(0, 10);

        // First, create the patient
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .insert({
            patient_id: newPatientId,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            age: parseInt(formData.age)
          })
          .select()
          .single();

        if (patientError) throw patientError;

        // Create the patient record with the provided diagnosis and doctor
        const { data: recordData, error: recordError } = await supabase
          .from("patient_records")
          .insert({
            patient_id: patientData.patient_id,
            diagnosis: formData.diagnosis.trim(),
            treatment: formData.treatment?.trim() || null,
            doctor_id: formData.doctorId || null
          })
          .select()
          .single();

        if (recordError) throw recordError;
      } else {
        // For existing patients, just create the record
        const { error: recordError } = await supabase
          .from("patient_records")
          .insert({
            patient_id: formData.patientId,
            diagnosis: formData.diagnosis.trim(),
            treatment: formData.treatment?.trim() || null,
            doctor_id: formData.doctorId || null
          });

        if (recordError) throw recordError;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error adding patient or patient record:", error);
      alert(error.message || "Failed to save patient. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Add Patient Record</h2>

        <div className="mb-4">
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-md ${isExistingPatient
                ? "bg-[#1e5631] text-white"
                : "bg-gray-200 text-gray-700"
                }`}
              onClick={() => setIsExistingPatient(true)}
            >
              Existing Patient
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md ${!isExistingPatient
                ? "bg-[#1e5631] text-white"
                : "bg-gray-200 text-gray-700"
                }`}
              onClick={() => setIsExistingPatient(false)}
            >
              Non-User Patient
            </button>
          </div>

          {isExistingPatient ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Search Patient</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
              />
              {formErrors.patientId && (
                <p className="mt-1 text-sm text-red-500">{formErrors.patientId}</p>
              )}
              {patientOptions.length > 0 && (
                <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {patientOptions.map((option) => (
                    <li
                      key={option.id}
                      onClick={() => {
                        setFormData((prevData) => ({ ...prevData, patientId: option.id }));
                        setSearchQuery(option.username ? `${option.name} (${option.username})` : option.name);
                        setPatientOptions([]);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                    >
                      <span>{option.name}</span>
                      {option.username && (
                        <span className="text-gray-500 text-sm">({option.username})</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${formErrors.firstName ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm`}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${formErrors.lastName ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm`}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${formErrors.age ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm`}
                />
                {formErrors.age && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.age}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Assign Doctor (Optional)</label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
          >
            <option value="">No specific doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctor_id} value={doctor.doctor_id}>
                {doctor.name} ({doctor.specialty})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.diagnosis ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm`}
          />
          {formErrors.diagnosis && (
            <p className="mt-1 text-sm text-red-500">{formErrors.diagnosis}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#1e5631] text-white px-4 py-2 rounded-md hover:bg-[#0d401d]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPatientPopup;
