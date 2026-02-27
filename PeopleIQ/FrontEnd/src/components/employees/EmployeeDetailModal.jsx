// components/employees/EmployeeDetailModal.jsx
import React, { useState, useEffect } from "react";

export default function EmployeeDetailModal({
  selectedEmployee,
  editForm,
  setEditForm,
  saving,
  handleUpdateEmployee,
  handleDeleteEmployee,
  setShowDetailModal,
}) {

  const [tab, setTab] = useState("profile");

  // normalize backend fields
  useEffect(() => {
    if (!selectedEmployee) return;

    setEditForm({
      name: selectedEmployee.name || selectedEmployee.Name || "",
      email: selectedEmployee.email || selectedEmployee.Email || "",
      department: selectedEmployee.department || selectedEmployee.Department || "",
      role: selectedEmployee.role || selectedEmployee.JobRole || "",
      status: selectedEmployee.status || selectedEmployee.Status || "Active",
      performanceRating: selectedEmployee.performanceRating || 0,
    });
  }, [selectedEmployee]);

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Employee Details</h2>
          <button onClick={() => setShowDetailModal(false)} className="text-2xl">✕</button>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          {["profile", "performance"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg border ${tab === t
                  ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                  : "border-slate-200"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="space-y-4">

          {tab === "profile" && (
            <>
              <input className="w-full p-3 border rounded-lg"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name"
              />
              <input className="w-full p-3 border rounded-lg bg-slate-100"
                value={editForm.email}
                disabled
              />
              <input className="w-full p-3 border rounded-lg"
                value={editForm.department}
                onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="Department"
              />
              <input className="w-full p-3 border rounded-lg"
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                placeholder="Role"
              />
            </>
          )}

          {tab === "performance" && (
            <input type="number" className="w-full p-3 border rounded-lg"
              value={editForm.performanceRating}
              onChange={e => setEditForm({ ...editForm, performanceRating: e.target.value })}
              placeholder="Performance Rating"
            />
          )}

        </div>

        {/* ACTIONS */}
        <div className="flex justify-between gap-3 pt-4">
          <button
            onClick={() => handleDeleteEmployee(selectedEmployee._id)}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          >
            Delete
          </button>

          <button
            onClick={() => handleUpdateEmployee(selectedEmployee._id, editForm)}
            className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-600 hover:bg-indigo-100"
          >
            {saving ? "Saving..." : "Update Employee"}
          </button>
        </div>

      </div>
    </div>
  );
}