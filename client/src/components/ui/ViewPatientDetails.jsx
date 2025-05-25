import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ViewPatientDetails = ({ recordId, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("patient_records")
          .select(`
            record_id,
            diagnosis,
            treatment,
            doctors (
              name,
              specialty
            ),
            patients(patient_id, first_name, last_name, age)
          `)
          .eq("record_id", recordId)
          .single();

        if (error) throw error;

        setPatient({
          name: `${data.patients.first_name} ${data.patients.last_name}`,
          age: data.patients.age,
          condition: data.diagnosis,
          treatment: data.treatment,
          doctor: data.doctors ? `${data.doctors.name} (${data.doctors.specialty})` : 'Not Assigned'
        });
      } catch (error) {
        console.error("Error fetching patient details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [recordId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p>Could not find patient details.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{patient.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <p className="text-gray-900">{patient.age}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <p className="text-gray-900">{patient.condition}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Treatment</label>
          <p className="text-gray-900">{patient.treatment || "N/A"}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Assigned Doctor</label>
          <p className="text-gray-900">{patient.doctor}</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientDetails;