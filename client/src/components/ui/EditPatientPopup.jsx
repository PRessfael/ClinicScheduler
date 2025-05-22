import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

const EditPatientPopup = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    diagnosis: patient.diagnosis || patient.condition || "",
    treatment: patient.treatment || "",
  });

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
        })
        .eq("record_id", patient.record_id || patient.id);

      if (recordError) throw recordError;

      onSave({
        ...patient,
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment?.trim() || null,
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
          <input
            type="text"
            value={patient.name || `${patient.first_name} ${patient.last_name}`}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1e5631] focus:border-[#1e5631] sm:text-sm"
          />
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

export default EditPatientPopup;
