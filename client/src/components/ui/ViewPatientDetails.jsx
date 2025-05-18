import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ViewPatientDetails = ({ recordId, onClose }) => {
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("patient_records")
          .select(`
            diagnosis,
            treatment,
            patients(
              first_name,
              last_name,
              age,
              users(username)
            )
          `)
          .eq("record_id", recordId)
          .single();

        if (error) throw error;

        setPatientDetails({
          fullName: `${data.patients.first_name} ${data.patients.last_name}`,
          username: data.patients.users.username,
          age: data.patients.age,
          condition: data.diagnosis,
          treatment: data.treatment,
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
    return <div>Loading...</div>;
  }

  if (!patientDetails) {
    return <div>Error loading patient details.</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
        <div className="mb-4">
          <strong>Username:</strong> {patientDetails.username}
        </div>
        <div className="mb-4">
          <strong>Full Name:</strong> {patientDetails.fullName}
        </div>
        <div className="mb-4">
          <strong>Age:</strong> {patientDetails.age}
        </div>
        <div className="mb-4">
          <strong>Condition:</strong> {patientDetails.condition}
        </div>
        <div className="mb-4">
          <strong>Treatment:</strong> {patientDetails.treatment}
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
