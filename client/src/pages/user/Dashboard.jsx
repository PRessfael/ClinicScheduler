import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import RecordsTable from "../../components/records/RecordsTable";

const UserDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.user_type === "user") {
          // Fetch user's medical records
          const { data: recordsData, error: recordsError } = await supabase
            .from("patient_records")
            .select("record_id, diagnosis, treatment")
            .eq("patient_id", user.id)
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
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Medical Records</h2>
        <RecordsTable records={records} />
      </div>
    </div>
  );
};

export default UserDashboard;