import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import RecordsTable from "../../components/records/RecordsTable";
import PatientProfileWarning from "@/components/ui/PatientProfileWarning";
import { usePatientProfile } from "@/hooks/usePatientProfile";

const UserDashboard = () => {
  const { user } = useAuth();
  const { patientProfile, hasPatientProfile, isLoading } = usePatientProfile();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!hasPatientProfile || !patientProfile?.patient_id) {
        setRecords([]);
        setLoading(false);
        return;
      }

      try {
        const { data: recordsData, error: recordsError } = await supabase
          .from("patient_records")
          .select("record_id, diagnosis, treatment")
          .eq("patient_id", patientProfile.patient_id)
          .order("record_id", { ascending: true });

        if (recordsError) throw recordsError;
        setRecords(recordsData);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [hasPatientProfile, patientProfile]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.username}</h1>

      {!hasPatientProfile && <PatientProfileWarning />}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Medical Records</h2>
        {hasPatientProfile ? (
          <RecordsTable records={records} />
        ) : (
          <p className="text-gray-600 text-center py-8">
            Please complete your patient profile to view medical records.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;