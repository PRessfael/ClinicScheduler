import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import EditPatientPopup from "../../components/ui/EditPatientPopup";
import ViewPatientDetails from "../../components/ui/ViewPatientDetails";
import DeleteWarning from "../../components/ui/DeleteWarning";
import AddPatientPopup from "../../components/ui/AddPatientPopup";

const DoctorDashboard = () => {
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
  const [addingPatient, setAddingPatient] = useState(false);

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

      setPatients((prevPatients) => prevPatients.filter((patient) => patient.record_id !== recordId));
    } catch (error) {
      console.error("Error deleting patient record:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingPatient) {
      await deletePatient(deletingPatient);
      setDeletingPatient(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingPatient(null);
  };

  const handleEditSave = (updatedPatient) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.record_id === editingPatient.record_id ? { ...patient, ...updatedPatient } : patient
      )
    );
    setEditingPatient(null);
  };

  const handleAddPatientSave = () => {
    setAddingPatient(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from("users")
          .select("id", { count: "exact" });

        if (error) throw error;

        setStats(prevStats => ({
          ...prevStats,
          totalPatients: count || 0,
        }));
      } catch (error) {
        console.error("Error fetching total patients:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { count: totalCount, error: totalError } = await supabase
          .from("appointments")
          .select("appointment_id", { count: "exact" });

        if (totalError) throw totalError;
        console.log("Total Appointments Query Result:", totalCount);

        const { count: pendingCount, error: pendingError } = await supabase
          .from("appointment_queue")
          .select("queue_id", { count: "exact" });

        if (pendingError) throw pendingError;
        console.log("Pending Appointments Query Result:", pendingCount);

        setStats(prevStats => ({
          ...prevStats,
          totalAppointments: (totalCount || 0) + (pendingCount || 0),
        }));
      } catch (error) {
        console.error("Error fetching total appointments including pending:", error);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const { count, error } = await supabase
          .from("appointment_queue")
          .select("queue_id", { count: "exact" });

        if (error) throw error;

        setStats(prevStats => ({
          ...prevStats,
          pendingAppointments: count || 0,
        }));
      } catch (error) {
        console.error("Error fetching pending appointments:", error);
      }
    };

    fetchPendingAppointments();
  }, []);

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        const { count, error } = await supabase
          .from("appointments")
          .select("id", { count: "exact" })
          .eq("status", "completed");

        if (error) throw error;

        setStats(prevStats => ({
          ...prevStats,
          completedAppointments: count || 0,
        }));
      } catch (error) {
        console.error("Error fetching completed appointments:", error);
      }
    };

    fetchCompletedAppointments();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patient_records")
          .select("record_id, patient_id, diagnosis, treatment")
          .order("record_id", { ascending: true });

        if (error) throw error;

        setPatients(data);
      } catch (error) {
        console.error("Error fetching patient records:", error);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
        <div className="bg-[#1e5631] text-white px-4 py-2 rounded-lg">
          Welcome, {user?.username || "Doctor"} ({user?.user_type})
        </div>
      </div>

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

      {(user?.user_type === "admin" || user?.user_type === "doctor") && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Patient Records</h2>
            <button
              className="bg-[#1e5631] text-white px-4 py-2 rounded-lg"
              onClick={() => setAddingPatient(true)}
            >
              Add Patient
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
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
                  <tr key={patient.record_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.record_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.patient_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.diagnosis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.treatment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => setViewingPatient(patient.record_id)}
                      >
                        View
                      </button>
                      <button
                        className="text-green-500 hover:underline"
                        onClick={() => setEditingPatient(patient)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => setDeletingPatient(patient.record_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewingPatient && (
        <ViewPatientDetails
          recordId={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}
      {editingPatient && (
        <EditPatientPopup
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSave={handleEditSave}
        />
      )}
      {deletingPatient && (
        <DeleteWarning
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
      {addingPatient && (
        <AddPatientPopup
          onClose={() => setAddingPatient(false)}
          onSave={handleAddPatientSave}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
