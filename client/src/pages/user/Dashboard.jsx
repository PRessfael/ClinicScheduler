import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import RecordsTable from "../../components/records/RecordsTable";
import PatientProfileWarning from "@/components/ui/PatientProfileWarning";

const UserDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPatientProfile, setHasPatientProfile] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.user_type === "user") {
          // Check for patient profile
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("patient_id, first_name, last_name")
            .eq("user_id", user.id)
            .single();

          if (patientError || !patientData || (!patientData.first_name && !patientData.last_name)) {
            setHasPatientProfile(false);
            setRecords([]);
            setLoading(false);
            return;
          }

          setHasPatientProfile(true);

          // Fetch user's medical records
          const { data: recordsData, error: recordsError } = await supabase
            .from("patient_records")
            .select("record_id, diagnosis, treatment")
            .eq("patient_id", patientData.patient_id)
            .order("record_id", { ascending: true });

          if (recordsError) throw recordsError;
          setRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
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