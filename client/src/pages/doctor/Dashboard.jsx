import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import EditPatientPopup from "../../components/ui/EditPatientPopup";
import ViewPatientDetails from "../../components/ui/ViewPatientDetails";
import DeleteWarning from "../../components/ui/DeleteWarning";
import AddPatientPopup from "../../components/ui/AddPatientPopup";
import DoctorAvailabilityTable from "../../components/ui/DoctorAvailabilityTable";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const totalPages = Math.ceil(totalRecords / patientsPerPage);

  // Fetch doctor_id for the current user
  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('doctor_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setDoctorId(data.doctor_id);
        }
      } catch (error) {
        console.error('Error fetching doctor ID:', error);
      }
    };

    fetchDoctorId();
  }, [user?.id]);

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
          .select("appointment_id", { count: "exact" })
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

      // After successful deletion, check if we need to adjust the current page
      const newTotalRecords = totalRecords - 1;
      const newTotalPages = Math.ceil(newTotalRecords / patientsPerPage);

      if (currentPage > newTotalPages && newTotalPages > 0) {
        // If we're on a page that no longer exists, go to the last page
        setCurrentPage(newTotalPages);
      } else {
        // Otherwise, refresh the current page
        fetchPatients();
      }

      // Update stats
      setTotalRecords(newTotalRecords);
      setStats(prev => ({ ...prev, totalPatients: newTotalRecords }));
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
  const refreshStats = async () => {
    try {
      const [
        { count: patientsCount },
        { count: totalAppCount },
        { count: pendingCount },
        { count: completedCount }
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact" }),
        supabase.from("appointments").select("appointment_id", { count: "exact" }),
        supabase.from("appointments").select("appointment_id", { count: "exact" }).eq("status", "pending"),
        supabase.from("appointments").select("appointment_id", { count: "exact" }).eq("status", "completed")
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
    setAddingPatient(false);
    // Re-fetch both patients and stats
    fetchPatients();
    refreshStats();
  };

  const fetchPatients = async () => {
    try {
      const from = (currentPage - 1) * patientsPerPage;
      const to = from + patientsPerPage - 1;

      // Get paginated records
      const { data, error, count } = await supabase
        .from("patient_records")
        .select(`
          record_id,
          diagnosis,
          treatment,
          doctor_id,
          doctors (
            name,
            specialty
          ),
          patients(patient_id, first_name, last_name, age)
        `, { count: 'exact' })
        .order("record_id", { ascending: true })
        .range(from, to);

      if (error) throw error;

      // Handle no data case
      if (!data || data.length === 0) {
        setPatients([]);
        setTotalRecords(count || 0);
        // If we're on a page higher than the total pages, go back to the last valid page
        const maxPage = Math.ceil((count || 0) / patientsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage);
        }
        return;
      }

      const formattedPatients = data.map(record => ({
        id: record.record_id,
        record_id: record.record_id,
        name: record.patients ? `${record.patients.first_name} ${record.patients.last_name}` : 'Unknown',
        age: record.patients?.age || 'N/A',
        condition: record.diagnosis || 'N/A',
        treatment: record.treatment || 'N/A',
        patient_id: record.patients?.patient_id,
        doctor: record.doctors ? `${record.doctors.name} (${record.doctors.specialty})` : 'Not Assigned'
      }));

      setPatients(formattedPatients);
      setTotalRecords(count || 0);
      setStats(prev => ({ ...prev, totalPatients: count || 0 }));
    } catch (error) {
      console.error("Error fetching patient records:", error);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, [currentPage, patientsPerPage]); // Refetch when page changes or number of patients per page changes

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

      {/* Patient Records Section */}
      {(user?.user_type === "admin" || user?.user_type === "doctor") && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
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
                    Assigned Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>              <tbody className="bg-white divide-y divide-gray-200">
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
                      {patient.treatment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.doctor}
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
          {/* Pagination Controls */}
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-t">            <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * patientsPerPage + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * patientsPerPage, totalRecords)}</span>{" "}
            of <span className="font-medium">{totalRecords}</span> results
          </div>
            <div className="flex space-x-2">              <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              Previous
            </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage >= totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Availability History Section */}
      {doctorId && (
        <div className="mt-8">
          <DoctorAvailabilityTable doctorId={doctorId} />
        </div>
      )}

      {/* Existing popups */}
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
