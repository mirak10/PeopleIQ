// components/employees/EmployeeTable.jsx
import React from "react";

const riskColors = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

export default function EmployeeTable({
  employees,
  loading,
  search,
  setSelectedEmployee,
  setEditForm,
  setShowDetailModal,
}) {

  // normalize backend -> frontend fields
  const normalize = (emp) => ({
    ...emp,
    name: emp.name || emp.Name || "",
    email: emp.email || emp.Email || "",
    department: emp.department || emp.Department || "",
    role: emp.role || emp.JobRole || "",
    status: emp.status || emp.Status || "Active",
  });

  const filteredEmployees = employees
    .map(normalize)
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(search?.toLowerCase() || "") ||
        emp.department.toLowerCase().includes(search?.toLowerCase() || "")
    );

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setEditForm(emp);
    setShowDetailModal(true);
  };

  return (
    <div className="flex-1 w-full overflow-x-auto overflow-y-auto bg-white rounded-lg sm:rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full divide-y divide-slate-200 text-sm sm:text-base">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Department</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Role</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {loading ? (
            <tr><td colSpan={4} className="text-center py-6 text-slate-500">Loading employees...</td></tr>
          ) : filteredEmployees.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-6 text-slate-500">No employees found</td></tr>
          ) : (
            filteredEmployees.map((emp) => (
              <tr
                key={emp._id}
                onClick={() => handleRowClick(emp)}
                className="hover:bg-slate-50 transition cursor-pointer"
              >
                <td className="px-6 py-4 font-medium">{emp.name}</td>
                <td className="px-6 py-4 hidden sm:table-cell">{emp.department}</td>
                <td className="px-6 py-4 hidden md:table-cell capitalize">{emp.role}</td>
                <td className="px-6 py-4 hidden lg:table-cell">{emp.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}