import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

const EditPatientPopup = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    condition: patient.condition || "",
    treatment: patient.treatment || "",
    age: patient.age || "", // Include age in the formData state
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log("Save button clicked"); // Debugging log
    try {
      console.log("Patient object:", patient); // Debugging log
      console.log("Updating patient record in Supabase", formData); // Debugging log

      // Update the `patient_records` table for `condition` and `treatment`
      const { error: recordError } = await supabase
        .from("patient_records")
        .update({
          diagnosis: formData.condition,
          treatment: formData.treatment,
        })
        .eq("record_id", patient.id);

      if (recordError) {
        console.error("Error updating patient record:", recordError);
        return;
      }

      console.log("Patient record updated successfully"); // Debugging log
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Unexpected error while saving patient record:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Patient</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 pl-2">Name</label>
          <input
            type="text"
            value={patient.name}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm pl-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 pl-2">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm pl-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 pl-2">Condition</label>
          <input
            type="text"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 pl-2">Treatment</label>
          <input
            type="text"
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPatientPopup;
