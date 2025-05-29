import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import EditPatientPopup from "../../components/ui/EditPatientPopup";
import AddPatientPopup from "../../components/ui/AddPatientPopup.jsx";
import ViewPatientDetails from "../../components/ui/ViewPatientDetails";
import DeleteWarning from "../../components/ui/DeleteWarning";
import DoctorScheduleTable from "../../components/ui/DoctorScheduleTable";
import DoctorAvailabilityTable from "../../components/ui/DoctorAvailabilityTable";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0
  });
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [isAddPatientPopupOpen, setIsAddPatientPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const totalPages = Math.ceil(totalRecords / patientsPerPage);

  const deletePatient = async (recordId) => {
    if (!recordId) {
      console.error("Invalid record ID provided for deletion.");
      return;
    }

    try {
      // First, get the patient_id from the patient_records table
      const { data: recordData, error: recordFetchError } = await supabase
        .from("patient_records")
        .select("patient_id")
        .eq("record_id", recordId)
        .single();

      if (recordFetchError) throw recordFetchError;

      // Delete the patient record first (due to foreign key constraint)
      const { error: recordDeleteError } = await supabase
        .from("patient_records")
        .delete()
        .eq("record_id", recordId);

      if (recordDeleteError) throw recordDeleteError;

      // Then delete the patient from patients table if they have no other records
      const { data: otherRecords, error: checkError } = await supabase
        .from("patient_records")
        .select("record_id")
        .eq("patient_id", recordData.patient_id);

      if (checkError) throw checkError;

      // Only delete from patients table if this was their last record and they're not a registered user
      if (otherRecords.length === 0) {
        const { data: patientData, error: patientFetchError } = await supabase
          .from("patients")
          .select("user_id")
          .eq("patient_id", recordData.patient_id)
          .single();

        if (!patientFetchError && !patientData.user_id) {
          // Only delete if the patient is not linked to a user account
          const { error: patientDeleteError } = await supabase
            .from("patients")
            .delete()
            .eq("patient_id", recordData.patient_id);

          if (patientDeleteError) throw patientDeleteError;
        }
      }

      setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== recordId));
      // Update all stats after deleting a patient
      updateAllStats();
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

  const handleAddPatientSave = () => {
    setIsAddPatientPopupOpen(false);
    // Re-fetch patients and update all stats
    fetchPatients();
    updateAllStats();
  };

  const handleDeleteConfirm = async () => {
    if (deletingPatient) {
      await deletePatient(deletingPatient.id);
      setDeletingPatient(null);
    }
  };

  const fetchPatients = async () => {
    try {
      const from = (currentPage - 1) * patientsPerPage;
      const to = from + patientsPerPage - 1;

      // Get paginated records with total count
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
          patients(first_name, last_name, age)
        `, { count: 'exact' })
        .order("record_id", { ascending: true })
        .range(from, to);

      if (error) throw error;

      const formattedPatients = data.map(record => ({
        id: record.record_id,
        name: `${record.patients.first_name} ${record.patients.last_name}`,
        age: record.patients.age,
        condition: record.diagnosis,
        treatment: record.treatment,
        doctor: record.doctors ? `${record.doctors.name} (${record.doctors.specialty})` : 'Not Assigned'
      }));

      setPatients(formattedPatients);
      setTotalRecords(count || 0);
    } catch (error) {
      console.error("Error fetching patient records:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchStats = async () => {
    try {
      const { count, error } = await supabase
        .from("patient_records")
        .select("record_id", { count: "exact" });

      if (error) throw error;

      setStats(prevStats => ({
        ...prevStats,
        totalPatients: count || 0,
      }));
    } catch (error) {
      console.error("Error fetching total patients:", error);
    }
  };

  // Fetch all stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

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

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchCompletedAppointments = async () => {
    try {
      const { count, error } = await supabase
        .from("appointments")
        .select("appointment_id", { count: "exact" })
        .eq("status", "confirmed");

      if (error) throw error;

      setStats(prevStats => ({
        ...prevStats,
        confirmedAppointments: count || 0,
      }));
    } catch (error) {
      console.error("Error fetching confirmed appointments:", error);
    }
  };

  useEffect(() => {
    fetchCompletedAppointments();
  }, []);

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      await fetchPatients();
    }
  };

  const updateAllStats = async () => {
    try {
      // Get total patients count
      const { count: patientsCount, error: patientsError } = await supabase
        .from("patient_records")
        .select("record_id", { count: "exact" });

      if (patientsError) throw patientsError;

      // Get appointments with different statuses
      const [
        { count: pendingCount },
        { count: confirmedCount },
        { count: cancelledCount }
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("appointment_id", { count: "exact" })
          .eq("status", "pending"),
        supabase
          .from("appointments")
          .select("appointment_id", { count: "exact" })
          .eq("status", "confirmed"),
        supabase
          .from("appointments")
          .select("appointment_id", { count: "exact" })
          .eq("status", "cancelled")
      ]);

      // Get queue entries (these are also pending appointments)
      const { count: queueCount, error: queueError } = await supabase
        .from("appointment_queue")
        .select("queue_id", { count: "exact" });

      if (queueError) throw queueError;

      // Calculate total appointments including queue entries
      const totalPendingAppointments = (pendingCount || 0) + (queueCount || 0);
      const totalAppointments =
        (pendingCount || 0) +
        (confirmedCount || 0) +
        (cancelledCount || 0) +
        (queueCount || 0);

      setStats({
        totalPatients: patientsCount || 0,
        totalAppointments,
        pendingAppointments: totalPendingAppointments,
        confirmedAppointments: confirmedCount || 0,
        cancelledAppointments: cancelledCount || 0
      });
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  useEffect(() => {
    updateAllStats();
  }, []);

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
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">TOTAL APPOINTMENTS</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
          <div className="mt-2 text-sm">
            <span className="text-blue-600">Active: {stats.confirmedAppointments + stats.pendingAppointments}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">PENDING APPOINTMENTS</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingAppointments}</p>
          <div className="mt-2 text-sm">
            <span className="text-yellow-600">Awaiting Approval</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">CONFIRMED</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.confirmedAppointments}</p>
          <div className="mt-2 text-sm text-red-600">
            Cancelled: {stats.cancelledAppointments}
          </div>
        </div>
      </div>

      {/* Doctor Schedules Section */}
      {(user?.user_type === "admin" || user?.user_type === "doctor") && (
        <>
          <DoctorScheduleTable />
          <DoctorAvailabilityTable />
        </>
      )}

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
                    Assigned Doctor
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-[#1e5631] hover:text-[#0d401d] mr-3"
                        onClick={() => setViewingPatient(patient.id)}
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
              New Patient Record
            </button>
            <div className="flex items-center">
              <div className="text-sm text-gray-700 mr-4">
                Showing <span className="font-medium">{(currentPage - 1) * patientsPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * patientsPerPage, totalRecords)}</span> of{" "}
                <span className="font-medium">{totalRecords}</span> patients
              </div>
              <div className="flex space-x-2">
                <button
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
          recordId={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}
      {deletingPatient && (
        <DeleteWarning
          message={`Are you sure you want to delete ${deletingPatient.name} record?`}
          onCancel={() => setDeletingPatient(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {isAddPatientPopupOpen && (
        <AddPatientPopup
          onClose={() => setIsAddPatientPopupOpen(false)}
          onSave={handleAddPatientSave}
        />
      )}
    </div>
  );
};

export default AdminDashboard;