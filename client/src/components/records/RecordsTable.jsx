import { SORT_OPTIONS } from "@/lib/constants.jsx";
import { useState } from "react";

const RecordsTable = ({
  records,
  searchTerm,
  sortOrder,
  setSearchTerm = () => {},
  setSortOrder = () => {}
}) => {
  // Local fallbacks when parent doesn't control state
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm ?? "");
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder ?? "newest");

  const currentSearch = searchTerm ?? localSearchTerm;
  const currentSortOrder = sortOrder ?? localSortOrder;

  // Filter records by diagnosis search (case-insensitive)
  let filteredRecords = records.filter((record) => {
    if (!currentSearch) return true;
    const diagnosis = String(record?.diagnosis ?? "").toLowerCase();
    return diagnosis.includes(currentSearch.toLowerCase());
  });

  // Sort records by newest/oldest
  if (currentSortOrder === "newest") {
    filteredRecords = filteredRecords.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } else if (currentSortOrder === "oldest") {
    filteredRecords = filteredRecords.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }

  return (
    <div className="p-6">
      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="relative md:w-64">
          <input
            type="text"
            placeholder="Search diagnosis..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
            value={currentSearch}
            onChange={(e) => {
              const val = e.target.value;
              setLocalSearchTerm(val);
              setSearchTerm(val);
            }}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]"
              value={currentSortOrder}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSortOrder(val);
                setSortOrder(val);
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Record ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnosis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Treatment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.record_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.record_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.diagnosis || 'No diagnosis recorded'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.treatment || 'No treatment recorded'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.doctor}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsTable;
