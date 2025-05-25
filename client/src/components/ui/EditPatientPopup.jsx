import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const EditPatientPopup = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    diagnosis: patient.condition || "",
    treatment: patient.treatment || "",
    doctorId: patient.doctor_id || ""
  });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.diagnosis?.trim()) {
        throw new Error("Diagnosis is required");
      }

      const { error: recordError } = await supabase
        .from("patient_records")
        .update({
          diagnosis: formData.diagnosis.trim(),
          treatment: formData.treatment?.trim() || null,
          doctor_id: formData.doctorId || null
        })
        .eq("record_id", patient.record_id || patient.id);

      if (recordError) throw recordError;

      // Get the selected doctor's information
      const selectedDoctor = doctors.find(d => d.doctor_id === formData.doctorId);
      const doctorDisplay = selectedDoctor
        ? `${selectedDoctor.name} (${selectedDoctor.specialty})`
        : 'Not Assigned';

      // Return updated data matching the structure expected by the table
      onSave({
        ...patient,
        condition: formData.diagnosis.trim(),
        treatment: formData.treatment?.trim() || null,
        doctor: doctorDisplay,
        doctor_id: formData.doctorId || null
      });
      onClose();
    } catch (error) {
      console.error("Error updating patient record:", error);
      alert(error.message || "Failed to update patient record. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Patient Record</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{patient.name}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Assigned Doctor</label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
            rows="3"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
            rows="3"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
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

export default EditPatientPopup;
