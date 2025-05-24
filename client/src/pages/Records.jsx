import RecordsTable from "@/components/records/RecordsTable";
import RecordsUpload from "@/components/records/RecordsUpload";
import { useRecords } from "@/hooks/useRecords";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const Records = () => {
  const {
    searchTerm,
    setSearchTerm,
    recordType,
    setRecordType,
    sortOrder,
    setSortOrder,
    currentTab,
    setCurrentTab,
    uploadFormData,
    setUploadFormData,
    formErrors,
    getFilteredRecords,
    handleFileChange,
    submitDocumentUpload
  } = useRecords();

  return (
    <section id="records" className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Medical Records Management
          </h2>

          {/* Records Dashboard */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Your Medical Records</h3>
                <p className="text-sm text-gray-600">Access and manage your health information securely.</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                  className={`px-6 py-3 ${
                    currentTab === "medical-history"
                      ? "border-b-2 border-[#1e5631] text-[#1e5631]"
                      : "text-gray-500 hover:text-gray-700"
                  } font-medium whitespace-nowrap`}
                  onClick={() => setCurrentTab("medical-history")}
                >
                  Medical History
                </button>
                <button
                  className={`px-6 py-3 ${
                    currentTab === "test-results"
                      ? "border-b-2 border-[#1e5631] text-[#1e5631]"
                      : "text-gray-500 hover:text-gray-700"
                  } font-medium whitespace-nowrap`}
                  onClick={() => setCurrentTab("test-results")}
                >
                  Test Results
                </button>
                <button
                  className={`px-6 py-3 ${
                    currentTab === "prescriptions"
                      ? "border-b-2 border-[#1e5631] text-[#1e5631]"
                      : "text-gray-500 hover:text-gray-700"
                  } font-medium whitespace-nowrap`}
                  onClick={() => setCurrentTab("prescriptions")}
                >
                  Prescriptions
                </button>
                <button
                  className={`px-6 py-3 ${
                    currentTab === "immunizations"
                      ? "border-b-2 border-[#1e5631] text-[#1e5631]"
                      : "text-gray-500 hover:text-gray-700"
                  } font-medium whitespace-nowrap`}
                  onClick={() => setCurrentTab("immunizations")}
                >
                  Immunizations
                </button>
              </div>
            </div>

            {/* Records Table */}
            <RecordsTable
              records={getFilteredRecords()}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              recordType={recordType}
              setRecordType={setRecordType}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </div>

          {/* Records Upload */}
          <RecordsUpload
            uploadFormData={uploadFormData}
            setUploadFormData={setUploadFormData}
            formErrors={formErrors}
            handleFileChange={handleFileChange}
            submitDocumentUpload={submitDocumentUpload}
          />
        </div>
      </div>
    </section>
  );
};

export default Records;
