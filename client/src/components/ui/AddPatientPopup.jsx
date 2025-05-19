import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AddPatientPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    treatment: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (searchQuery.length < 3) {
        setPatientOptions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("patients")
          .select("patient_id, first_name, last_name")
          .or(
            `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
          );

        if (error) throw error;

        const formattedOptions = data.map((patient) => ({
          id: patient.patient_id,
          name: `${patient.first_name} ${patient.last_name}`,
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
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_records")
        .insert({
          record_id: Math.random().toString(36).substr(2, 10), // Generate a random record_id
          patient_id: formData.patientId,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
        });

      if (error) throw error;

      console.log("New patient record added successfully", data);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error adding new patient record:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {patientOptions.length > 0 && (
            <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
              {patientOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => {
                    setFormData((prevData) => ({ ...prevData, patientId: option.id }));
                    setSearchQuery(option.name);
                    setPatientOptions([]);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

export default AddPatientPopup;
