import React from "react";

const ViewPatientDetails = ({ patient, onClose }) => {
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