// pages/EmployeeDirectory.jsx
import React from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import EmployeeTable from "../components/employees/EmployeeTable";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EmployeeDetailModal from "../components/employees/EmployeeDetailModal";
import useEmployees from "../hooks/useEmployees";

export default function EmployeeDirectory() {
  const { user } = useAuth();
  const {
    employees,
    loading,
    message,
    setMessage,
    search,
    setSearch,
    showModal,
    setShowModal,
    mode,
    setMode,
    form,
    setForm,
    saving,
    handleAddEmployee,
    bulkFile,
    setBulkFile,
    uploading,
    handleBulkUpload,
    downloadTemplate,
    selectedEmployee,
    setSelectedEmployee,
    showDetailModal,
    setShowDetailModal,
    editForm,
    setEditForm,
    handleUpdateEmployee,
    handleDeleteEmployee
  } = useEmployees(user);

  const role = user?.role?.toLowerCase();
  const canAddEmployee = role === "admin" || role === "hr";

  const roleOptions =
    role === "admin"
      ? ["admin", "hr", "manager", "employee"]
      : role === "hr"
        ? ["manager", "employee"]
        : [];

  //   MANAGER FILTERING (no UI changes)
  const visibleEmployees =
    role === "manager"
      ? employees.filter(emp => emp.managerId === user.id)
      : employees;

  //   TEAM KPIs (manager only)
  const teamSize = visibleEmployees.length;

  const avgPerformance =
    teamSize > 0
      ? (
        visibleEmployees.reduce(
          (acc, e) => acc + (e.performanceRating || 0),
          0
        ) / teamSize
      ).toFixed(1)
      : 0;

  return (
    <div className="h-full bg-slate-50 flex flex-col space-y-3 sm:space-y-4 md:space-y-6">

      {/* MESSAGE */}
      {message && (
        <div className="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base">
          {message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {role === "manager" ? "My Team" : "Employees"}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            {role === "manager"
              ? "Overview and management of your team."
              : "Search and manage employee records."}
          </p>
        </div>

        {canAddEmployee && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center sm:justify-start gap-2 bg-indigo-600 text-indigo-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} /> Add Employee
          </button>
        )}
      </div>

      {/*   MANAGER KPIs BAR (appears only for managers) */}
      {role === "manager" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500">Team Size</p>
            <p className="text-xl font-bold">{teamSize}</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500">Avg Performance</p>
            <p className="text-xl font-bold">{avgPerformance}</p>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search employees or departments..."
          className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* EMPLOYEE TABLE */}
      <EmployeeTable
        employees={visibleEmployees}
        loading={loading}
        search={search}
        setSelectedEmployee={setSelectedEmployee}
        setEditForm={setEditForm}
        setShowDetailModal={setShowDetailModal}
      />

      {/* ADD EMPLOYEE MODAL */}
      {showModal && (
        <AddEmployeeModal
          mode={mode}
          setMode={setMode}
          form={form}
          setForm={setForm}
          saving={saving}
          handleAddEmployee={handleAddEmployee}
          bulkFile={bulkFile}
          setBulkFile={setBulkFile}
          uploading={uploading}
          handleBulkUpload={handleBulkUpload}
          downloadTemplate={downloadTemplate}
          setShowModal={setShowModal}
          roleOptions={roleOptions}
        />
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          editForm={editForm}
          setEditForm={setEditForm}
          saving={saving}
          deleting={false}
          handleUpdateEmployee={handleUpdateEmployee}
          handleDeleteEmployee={handleDeleteEmployee}
          setShowDetailModal={setShowDetailModal}
          roleOptions={roleOptions}
          canEditPerformance={role === "manager"}
        />
      )}
    </div>



  );

}