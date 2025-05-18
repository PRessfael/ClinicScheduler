import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 145,
    totalAppointments: 87,
    pendingAppointments: 23,
    completedAppointments: 64
  });
  
  const [patients, setPatients] = useState([
    { id: 1, name: "John Doe", age: 45, lastVisit: "2023-04-15", condition: "Hypertension" },
    { id: 2, name: "Jane Smith", age: 32, lastVisit: "2023-04-12", condition: "Diabetes" },
    { id: 3, name: "Mike Johnson", age: 28, lastVisit: "2023-04-08", condition: "Asthma" },
    { id: 4, name: "Sarah Williams", age: 56, lastVisit: "2023-04-05", condition: "Arthritis" },
    { id: 5, name: "David Brown", age: 37, lastVisit: "2023-03-30", condition: "Anxiety" }
  ]);

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
      {user?.user_type === "admin" && (
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
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
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
                      {patient.lastVisit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#1e5631] hover:text-[#0d401d] mr-3">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between">
            <button className="bg-[#1e5631] text-white px-4 py-2 rounded hover:bg-[#0d401d]">
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
    </div>
  );
};

export default AdminDashboard;