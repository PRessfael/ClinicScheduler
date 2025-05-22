import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import EditPatientPopup from "../../components/ui/EditPatientPopup";
import AddPatientPopup from "../../components/ui/AddPatientPopup.jsx";
import ViewPatientDetails from "../../components/ui/ViewPatientDetails";
import DeleteWarning from "../../components/ui/DeleteWarning";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [isAddPatientPopupOpen, setIsAddPatientPopupOpen] = useState(false);

  const deletePatient = async (recordId) => {
    if (!recordId) {
      console.error("Invalid record ID provided for deletion.");
      return;
    }

    try {
      const { error } = await supabase
        .from("patient_records")
        .delete()
        .eq("record_id", recordId);

      if (error) throw error;

      setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== recordId));
    } catch (error) {
      console.error("Error deleting patient record:", error);
    }
  };

  const handleEditSave = (updatedPatient) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === editingPatient.id ? { ...patient, ...updatedPatient } : patient
      )
    );
    setEditingPatient(null);
  };

  const handleAddPatient = () => {
    setIsAddPatientPopupOpen(true);
  };
  const refreshStats = async () => {
    try {
      const [
        { count: patientsCount }, 
        { count: totalAppCount }, 
        { count: pendingCount }, 
        { count: completedCount }
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact" }),
        supabase.from("appointments").select("*", { count: "exact" }),
        supabase.from("appointments").select("*", { count: "exact" }).eq("status", "pending"),
        supabase.from("appointments").select("*", { count: "exact" }).eq("status", "completed")
      ]);

      setStats({
        totalPatients: patientsCount || 0,
        totalAppointments: totalAppCount || 0,
        pendingAppointments: pendingCount || 0,
        completedAppointments: completedCount || 0
      });
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  };

  const handleAddPatientSave = () => {
    setIsAddPatientPopupOpen(false);
    // Re-fetch both patients and stats
    fetchPatients();
    refreshStats();
  };

  const handleDeleteConfirm = async () => {
    if (deletingPatient) {
      await deletePatient(deletingPatient.id);
      setDeletingPatient(null);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_records")
        .select(`
          record_id,
          diagnosis,
          treatment,
          patients(first_name, last_name, age)
        `)
        .order("record_id", { ascending: true });

      if (error) throw error;

      const formattedPatients = data.map(record => ({
        id: record.record_id, // Use record_id here
        name: `${record.patients.first_name} ${record.patients.last_name}`,
        age: record.patients.age,
        condition: record.diagnosis,
        treatment: record.treatment
      }));

      setPatients(formattedPatients);
    } catch (error) {
      console.error("Error fetching patient records:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);
  
  // Fetch all stats on component mount
  useEffect(() => {
    refreshStats();
  }, []);

  //---------------------------------//
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="bg-[#1e5631] text-white px-4 py-2 rounded-lg">
          Welcome, {user?.username || "Admin"} ({user?.user_type})
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1e5631]">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">TOTAL PATIENTS</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#ffd700]">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">TOTAL APPOINTMENTS</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">PENDING APPOINTMENTS</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingAppointments}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">COMPLETED APPOINTMENTS</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.completedAppointments}</p>
        </div>
      </div>

      {/* Patient Records Section */}
      {(user?.user_type === "admin" || user?.user_type === "doctor") && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Patient Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.treatment || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-[#1e5631] hover:text-[#0d401d] mr-3"
                        onClick={() => setViewingPatient(patient)}
                      >
                        View
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => setEditingPatient(patient)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => setDeletingPatient(patient)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between">
            <button
              className="bg-[#1e5631] text-white px-4 py-2 rounded hover:bg-[#0d401d]"
              onClick={handleAddPatient}
            >
              Add New Patient
            </button>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">{stats.totalPatients}</span> patients
              </span>
              <div className="flex">
                <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1 rounded-l">
                  Previous
                </button>
                <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1 rounded-r ml-px">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingPatient && (
        <EditPatientPopup
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSave={handleEditSave}
        />
      )}
      {viewingPatient && (
        <ViewPatientDetails
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}
      {deletingPatient && (
        <DeleteWarning
          message={`Are you sure you want to delete ${deletingPatient.name}?`}
          onCancel={() => setDeletingPatient(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}      {isAddPatientPopupOpen && (
        <AddPatientPopup
          onClose={() => setIsAddPatientPopupOpen(false)}
          onSave={() => {
            handleAddPatientSave();
            refreshStats();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;